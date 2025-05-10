from django.core.management.base import BaseCommand
from pathlib import Path
import tensorflow as tf
from transformers import BertTokenizer, TFBertModel
import pickle
from datasets import load_dataset
from backend.Math_testing import OpenMathProcessor
import logging
import os
from django.conf import settings
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.models import Model

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Trains and saves the math evaluation model'

    def handle(self, *args, **options):
        # Define paths using Django's BASE_DIR
        MODEL_DIR = Path(settings.BASE_DIR) / 'backend' / 'models'
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        MODEL_PATH = MODEL_DIR / 'math_step_validator.h5'
        TOKENIZER_PATH = MODEL_DIR / 'math_tokenizer.pkl'

        self.stdout.write(f"Training math evaluator model, saving to {MODEL_PATH}")

        try:
            # Your existing training code
            dataset = load_dataset("nvidia/OpenMathReasoning", split="train")
            processor = OpenMathProcessor()
            processed_data = processor.process_dataset(dataset)
            
            high_school_data = [
                d for d in processed_data 
                if d['grade'] in ['8th', '9th', '10th', '11th', '12th']
            ]

            tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
            texts = [
                f"Problem: {d['problem_text']}\nWorkings: {' '.join(d['workings'])}"
                for d in high_school_data
            ]
            labels = [d['label'] for d in high_school_data]

            inputs = tokenizer(
                texts, 
                padding='max_length', 
                truncation=True, 
                max_length=256,
                return_tensors='tf'
            )

            train_dataset = tf.data.Dataset.from_tensor_slices((
                {'input_ids': inputs['input_ids'], 'attention_mask': inputs['attention_mask']},
                tf.constant(labels)
            )).shuffle(1000).batch(32)

            # Model building
            bert = TFBertModel.from_pretrained('bert-base-uncased')
            input_ids = Input(shape=(256,), dtype=tf.int32, name='input_ids')
            attention_mask = Input(shape=(256,), dtype=tf.int32, name='attention_mask')
            embeddings = bert(input_ids, attention_mask=attention_mask).last_hidden_state
            lstm_out = tf.keras.layers.Bidirectional(
                tf.keras.layers.LSTM(64, return_sequences=True))(embeddings)
            attention = tf.keras.layers.MultiHeadAttention(
                num_heads=4, key_dim=64)(lstm_out, lstm_out)
            flattened = tf.keras.layers.Flatten()(attention)
            dense = tf.keras.layers.Dense(64, activation='relu')(flattened)
            output = tf.keras.layers.Dense(1, activation='sigmoid')(dense)
            
            model = tf.keras.Model(
                inputs=[input_ids, attention_mask],
                outputs=output,
                name="math_step_validator"
            )
            model.compile(
                optimizer=tf.keras.optimizers.Adam(3e-5),
                loss='binary_crossentropy',
                metrics=['accuracy']
            )

            # Train/validation split
            val_size = int(0.2 * len(high_school_data))
            train_data = train_dataset.skip(val_size)
            val_data = train_dataset.take(val_size)

            # Training
            history = model.fit(
                train_data,
                validation_data=val_data,
                epochs=5,
                callbacks=[
                    tf.keras.callbacks.EarlyStopping(patience=3),
                    tf.keras.callbacks.ModelCheckpoint(
                        filepath=str(MODEL_PATH),
                        save_best_only=True,
                        save_weights_only=False,
                        save_format='h5',
                        monitor='val_accuracy',
                        mode='max',
                        verbose=1
                    )
                ]
            )

            # Save tokenizer
            with open(TOKENIZER_PATH, 'wb') as f:
                pickle.dump(tokenizer, f)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully trained and saved model to {MODEL_PATH}\n"
                    f"Tokenizer saved to {TOKENIZER_PATH}\n"
                    f"Final validation accuracy: {history.history['val_accuracy'][-1]:.2f}"
                )
            )
            
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            self.stdout.write(
                self.style.ERROR(f"Training failed: {str(e)}")
            )
            raise