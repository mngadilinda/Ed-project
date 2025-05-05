# services.py
from django.db import transaction
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from .models import Program, Module, Topic, Assessment, Question, TopicResource, ContentUpload
import json
import logging
from django.utils import timezone


logger = logging.getLogger(__name__)

def validate_upload_data(data, required_fields, model_name):
    """Generic validation for upload data"""
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        raise ValidationError(
            f"Missing required fields for {model_name}: {', '.join(missing_fields)}"
        )

def update_upload_status(upload, status, log_message=None):
    """Helper to update upload status consistently"""
    upload.status = status
    if log_message:
        upload.log = log_message
    upload.save()

@transaction.atomic
def process_program_upload(content, upload):
    required_fields = ['title', 'description', 'price_monthly', 'price_yearly']
    
    try:
        data = json.loads(content)
        validate_upload_data(data, required_fields, 'program')
        
        program = Program.objects.create(
            title=data['title'],
            description=data['description'],
            price_monthly=float(data['price_monthly']),
            price_yearly=float(data['price_yearly']),
            is_active=data.get('is_active', True),
            thumbnail=upload.text_file if 'thumbnail' in upload.text_file.name else None
        )
        
        upload.content_id = program.id
        upload.content_type = 'program'
        update_upload_status(
            upload,
            'COMPLETED',
            f"Created program: {program.title} (ID: {program.id})"
        )
        return program
        
    except json.JSONDecodeError as e:
        error_msg = f"Invalid JSON format: {str(e)}"
        logger.error(error_msg)
        update_upload_status(upload, 'FAILED', error_msg)
        raise ValidationError(error_msg)
    except Exception as e:
        error_msg = f"Program processing error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        update_upload_status(upload, 'FAILED', error_msg)
        raise ValidationError(error_msg)

@transaction.atomic
def process_module_upload(content, upload):
    required_fields = ['program_id', 'title', 'description']
    
    try:
        data = json.loads(content)
        validate_upload_data(data, required_fields, 'module')
        
        program = Program.objects.get(id=data['program_id'])
        module = Module.objects.create(
            program=program,
            title=data['title'],
            description=data['description'],
            order=data.get('order', 0),
            is_unlocked=data.get('is_unlocked', False),
            thumbnail=upload.text_file if 'thumbnail' in upload.text_file.name else None
        )
        
        upload.content_id = module.id
        upload.content_type = 'module'
        update_upload_status(
            upload,
            'COMPLETED',
            f"Created module: {module.title} in program {program.title}"
        )
        return module
        
    except ObjectDoesNotExist:
        error_msg = f"Program with ID {data['program_id']} does not exist"
        logger.error(error_msg)
        update_upload_status(upload, 'FAILED', error_msg)
        raise ValidationError(error_msg)
    except Exception as e:
        error_msg = f"Module processing error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        update_upload_status(upload, 'FAILED', error_msg)
        raise ValidationError(error_msg)

@transaction.atomic
def process_topic_upload(content, upload):
    required_fields = ['module_id', 'title', 'content']
    
    try:
        data = json.loads(content)
        validate_upload_data(data, required_fields, 'topic')
        
        module = Module.objects.get(id=data['module_id'])
        topic = Topic.objects.create(
            module=module,
            title=data['title'],
            content=data['content'],
            order=data.get('order', 0)
        )
        
        # Process resources
        resource_errors = []
        for i, resource in enumerate(data.get('resources', [])):
            try:
                TopicResource.objects.create(
                    topic=topic,
                    resource_type=resource['type'],
                    url=resource['url'],
                    title=resource['title'],
                    duration=resource.get('duration')
                )
            except Exception as e:
                resource_errors.append(f"Resource {i+1}: {str(e)}")
        
        upload.content_id = topic.id
        upload.content_type = 'topic'
        
        log_msg = f"Created topic: {topic.title} with {len(data.get('resources', []))} resources"
        if resource_errors:
            log_msg += f" (Errors: {'; '.join(resource_errors)})"
        
        update_upload_status(upload, 'COMPLETED', log_msg)
        return topic
        
    except Exception as e:
        error_msg = f"Topic processing error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        update_upload_status(upload, 'FAILED', error_msg)
        raise ValidationError(error_msg)

@transaction.atomic
def process_assessment_upload(content, upload):
    required_fields = ['title', 'description', 'questions']
    
    try:
        data = json.loads(content)
        validate_upload_data(data, required_fields, 'assessment')
        
        # Determine parent (module or topic)
        parent = None
        parent_field = None
        if 'module_id' in data:
            parent = Module.objects.get(id=data['module_id'])
            parent_field = 'module'
        elif 'topic_id' in data:
            parent = Topic.objects.get(id=data['topic_id'])
            parent_field = 'topic'
        else:
            raise ValidationError("Either module_id or topic_id must be provided")
        
        assessment = Assessment.objects.create(
            title=data['title'],
            description=data['description'],
            passing_score=data.get('passing_score', 70),
            is_proctored=data.get('is_proctored', False),
            **{parent_field: parent}
        )
        
        # Process questions
        question_errors = []
        for i, question in enumerate(data['questions']):
            try:
                Question.objects.create(
                    assessment=assessment,
                    question_type=question['type'],
                    text=question['text'],
                    options=question.get('options', []),
                    correct_answer=question['correct_answer'],
                    difficulty=question.get('difficulty', 1),
                    concept_tags=question.get('concept_tags', '')
                )
            except Exception as e:
                question_errors.append(f"Question {i+1}: {str(e)}")
        
        upload.content_id = assessment.id
        upload.content_type = 'assessment'
        
        log_msg = f"Created assessment: {assessment.title} with {len(data['questions'])} questions"
        if question_errors:
            log_msg += f" (Errors: {'; '.join(question_errors)})"
        
        update_upload_status(upload, 'COMPLETED', log_msg)
        return assessment
        
    except Exception as e:
        error_msg = f"Assessment processing error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        update_upload_status(upload, 'FAILED', error_msg)
        raise ValidationError(error_msg)
    

# services.py
def process_content_upload(upload_id):
    """
    Processes content upload with proper transaction handling
    Note: Individual processors handle their own atomic transactions
    """
    try:
        # Outer transaction to ensure we can record the failure if something goes wrong
        with transaction.atomic():
            upload = ContentUpload.objects.select_for_update().get(id=upload_id)
            update_upload_status(upload, 'PROCESSING', 'Starting content processing')

        # Process outside the outer transaction to allow individual processors
        # to manage their own transactions
        try:
            with upload.text_file.open('r') as f:
                content = f.read()

            # Process based on upload type - each processor manages its own transaction
            if upload.upload_type == 'PROGRAM':
                process_program_upload(content, upload)
            elif upload.upload_type == 'MODULE':
                process_module_upload(content, upload)
            elif upload.upload_type == 'TOPIC':
                process_topic_upload(content, upload)
            elif upload.upload_type == 'ASSESSMENT':
                process_assessment_upload(content, upload)
            else:
                raise ValidationError(f"Unknown upload type: {upload.upload_type}")

            # Final success update - no need for transaction here as it's just status update
            update_upload_status(upload, 'COMPLETED', 'Processing completed successfully')

        except Exception as processing_error:
            # Use transaction to ensure failure status is recorded
            with transaction.atomic():
                upload.refresh_from_db()
                error_msg = f"Processing failed: {str(processing_error)}"
                logger.error(f"Upload {upload_id} failed: {error_msg}", exc_info=True)
                update_upload_status(
                    upload,
                    'FAILED',
                    f"Processing error: {error_msg}\nPlease check the file format."
                )
                upload.processed_at = timezone.now()
                upload.save()

    except ContentUpload.DoesNotExist:
        logger.error(f"Upload ID {upload_id} not found")
    except Exception as unexpected_error:
        logger.critical(
            f"System error processing upload {upload_id}: {str(unexpected_error)}",
            exc_info=True
        )
        # Attempt to record failure if upload object exists
        if 'upload' in locals():
            with transaction.atomic():
                upload.refresh_from_db()
                update_upload_status(
                    upload,
                    'FAILED',
                    "A system error occurred. Our team has been notified."
                )
                upload.processed_at = timezone.now()
                upload.save()