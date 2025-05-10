import tensorflow as tf
from transformers import BertTokenizer, TFBertModel
import numpy as np
import re
from sympy import sympify, Eq, simplify
from sympy.parsing.sympy_parser import parse_expr
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)



class MathAnswerEvaluator:
    def __init__(self):
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.replacements = [
            (r'\b(\d+)\s*([a-zA-Z])\b', r'\1*\2'),
            (r'\s+', ' '),
            ('×', '*'), ('÷', '/'), ('^', '**'),
            (r'\\frac\{([^}]+)\}\{([^}]+)\}', r'(\1)/(\2)'),
            (r'\\sqrt\{([^}]+)\}', r'sqrt(\1)')
        ]
        
        self.step_validator = None
        self.model_path = os.path.join(settings.BASE_DIR, 'backend', 'models', 'math_step_validator.h5')
        
        try:
            if os.path.exists(self.model_path):
                self.step_validator = tf.keras.models.load_model(self.model_path)
                logger.info("Math evaluator model loaded successfully")
            else:
                logger.warning(f"Math evaluator model not found at {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load math evaluator model: {str(e)}")

    def is_ready(self):
        return self.step_validator is not None

    def evaluate(self, problem_text: str, user_workings: list) -> dict:
        """Main evaluation method"""
        if not self.step_validator:
            return {
                'is_correct': False,
                'score': 0.0,
                'errors': ['model_not_loaded'],
                'expected_answer': ''
            }
        
        try:
            # Neural network evaluation
            neural_result = self._neural_evaluation(problem_text, user_workings)
            
            # Symbolic verification
            symbolic_correct = False
            if user_workings:
                try:
                    final_answer = user_workings[-1].split('=')[-1].strip()
                    symbolic_correct = self._symbolic_check(
                        final_answer, 
                        neural_result['expected_answer']
                    )
                except Exception as sym_error:
                    logger.debug(f"Symbolic check failed: {sym_error}")
            
            # Combined score
            combined_score = (neural_result['score'] * 0.7) + (symbolic_correct * 0.3)
            
            return {
                'is_correct': combined_score > 0.7,
                'score': float(combined_score),
                'errors': neural_result['errors'],
                'expected_answer': neural_result['expected_answer']
            }
        except Exception as e:
            logger.error(f"Evaluation failed: {str(e)}")
            return {
                'is_correct': False,
                'score': 0.0,
                'errors': ['evaluation_error'],
                'expected_answer': ''
            }
    
    def _neural_evaluation(self, problem_text: str, user_workings: list) -> dict:
        """Evaluate using neural network"""
        # Prepare input
        text = f"Problem: {problem_text}\nWorkings: {' '.join(user_workings)}"
        inputs = self.tokenizer(
            text,
            return_tensors='tf',
            padding='max_length',
            truncation=True,
            max_length=256
        )
        
        # Get prediction
        score = self.step_validator.predict([
            inputs['input_ids'],
            inputs['attention_mask']
        ])[0][0]
        
        # Detect errors
        errors = self._detect_errors(problem_text, user_workings)
        
        return {
            'score': float(score),
            'errors': errors,
            'expected_answer': self._extract_expected_answer(problem_text)
        }
    
    def _symbolic_check(self, user_answer: str, correct_answer: str) -> bool:
        """Check answer symbolically"""
        try:
            user_expr = parse_expr(self._normalize_math(user_answer))
            correct_expr = parse_expr(self._normalize_math(correct_answer))
            return simplify(user_expr - correct_expr) == 0
        except:
            return False
    
    def _detect_errors(self, problem_text: str, workings: list) -> list:
        """Detect common math errors"""
        errors = []
        text = problem_text + ' ' + ' '.join(workings)
        
        # Sign errors
        if re.search(r'[\+\-]\s*[\+\-]', text):
            errors.append('sign_error')
        
        # Missing steps (abrupt jumps)
        if len(workings) > 2:
            step_changes = []
            for i in range(1, len(workings)):
                # Simple heuristic - count changed elements
                prev = set(re.findall(r'[\w\+\-\*/=]+', workings[i-1]))
                curr = set(re.findall(r'[\w\+\-\*/=]+', workings[i]))
                step_changes.append(len(curr - prev))
            
            if max(step_changes) > 5:  # Large jump in complexity
                errors.append('missing_step')
        
        return errors
    
    def _normalize_math(self, expr: str) -> str:
        """Normalize math expressions"""
        for pattern, repl in self.replacements:
            expr = re.sub(pattern, repl, expr)
        return expr
    
    def _extract_expected_answer(self, problem_text: str) -> str:
        """Extract expected answer from problem text"""
        # Simple pattern matching - would need enhancement
        if '=' in problem_text:
            return problem_text.split('=')[-1].strip()
        return ''