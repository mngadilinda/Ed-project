import factory
from django.core.files.base import ContentFile
from .models import ContentUpload, UserProfile
from faker import Faker

fake = Faker()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserProfile

    email = factory.LazyAttribute(lambda _: fake.email())
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
    role = 'EDUCATOR'
    is_approved = True

class ContentUploadFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ContentUpload

    educator = factory.SubFactory(UserFactory)
    upload_type = 'PROGRAM'
    status = 'PENDING'
    text_file = factory.LazyAttribute(
        lambda _: ContentFile(
            b'{"title": "Test Program", "description": "Test", "price_monthly": 10, "price_yearly": 100}',
            name='test_program.json'
        )
    )