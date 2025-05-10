from datasets import Dataset
import sympy as sp
import re
from typing import Dict, List
import numpy as np


class OpenMathProcessor:
    def __init__ (self):
        self.grade_mapping = {
            'primary': ['6th', '7th', '8th'],
            'high_school' : ['9th', '10th', '11th', '12th'],
            'Varsity' : ['Varsity']
        }

        self.replacements = [
            (r'\b(\d+)\s*([a-zA-Z])\b', r'\1*\2'),  # 2x → 2*x
            (r'\s+', ' '),  # Normalize whitespace
            ('×', '*'), ('÷', '/'), ('^', '**'),
            (r'\\frac\{([^}]+)\}\{([^}]+)\}', r'(\1)/(\2)'),  # LaTeX fractions
            (r'\\sqrt\{([^}]+)\}', r'sqrt(\1)')  # LaTeX sqrt
        ]

    def process_dataset(self, hf_dataset: Dataset) -> List[Dict]:
        """Process the entire HuggingFace dataset"""
        processed_data = []
        
        # Process each split (train, validation, test)
        for split in hf_dataset.keys():
            for problem in hf_dataset[split]:
                processed = self._process_problem(problem)
                processed_data.extend(self._generate_samples(processed))
        
        return processed_data
    
    def _process_problem(self, problem: Dict) -> Dict:
        """Process a single problem"""
        # Normalize the problem statement
        problem_text = self._normalize_text(problem['problem'])
        
        # Process solution
        solution = problem.get('solution', {})
        steps = [self._normalize_text(step) for step in solution.get('steps', [])]
        
        # Process metadata
        metadata = problem.get('metadata', {})
        grade = self._map_grade_level(metadata.get('grade_level', 'high_school'))
        
        return {
            'id': problem['id'],
            'text': problem_text,
            'domain': metadata.get('domain', 'algebra'),
            'grade_level': grade,
            'concepts': metadata.get('concepts', []),
            'correct_steps': steps,
            'correct_answer': self._normalize_text(solution.get('answer', '')),
            'error_analysis': problem.get('error_analysis', {})
        }
    
    def _generate_samples(self, problem: Dict) -> List[Dict]:
        """Generate training samples from one problem"""
        samples = []
        
        # Add correct sample
        samples.append({
            'problem_id': problem['id'],
            'text': problem['text'],
            'workings': problem['correct_steps'],
            'answer': problem['correct_answer'],
            'domain': problem['domain'],
            'grade': problem['grade_level'],
            'concepts': problem['concepts'],
            'label': 1,  # Correct
            'error_type': None,
            'source': 'correct_solution'
        })
        
        # Add incorrect samples
        for error in problem['error_analysis'].get('common_errors', []):
            samples.append({
                'problem_id': f"{problem['id']}_{error['type']}",
                'text': problem['text'],
                'workings': [self._normalize_text(step) for step in error.get('incorrect_steps', [])],
                'answer': self._normalize_text(error.get('incorrect_answer', '')),
                'domain': problem['domain'],
                'grade': problem['grade_level'],
                'concepts': problem['concepts'],
                'label': 0,  # Incorrect
                'error_type': error['type'],
                'source': 'common_error'
            })
        
        return samples
    

    def _normalize_text(self, text: str) -> str:
        """Normalize mathematical text"""
        if not isinstance(text, str):
            return str(text)
            
        for pattern, repl in self.replacements:
            text = re.sub(pattern, repl, text)
        return text.strip()
    
    def _map_grade_level(self, level: str) -> str:
        """Map to specific grade"""
        for category, grades in self.grade_mapping.items():
            if level == category:
                return grades[0]  # Return first grade in category
        return '10th'  # Default
    
