# backend/management/commands/seed_math.py
import requests
from bs4 import BeautifulSoup
from backend.models import Program, Module, Topic
from django.core.management.base import BaseCommand


LIBRETEXTS_MAP = {
    "Algebra": {
        "url": "https://math.libretexts.org/Bookshelves/Algebra",
        "modules": ["Foundations", "Equations", "Functions", "Polynomials"]
    },
    # Add other subjects similarly
}

class Command(BaseCommand):
    def handle(self, *args, **options):
        for subject, data in LIBRETEXTS_MAP.items():
            program = Program.objects.create(
                title=f"{subject} Fundamentals",
                description=f"LibreTexts {subject} Curriculum",
                price_monthly=0,
                price_yearly=0
            )
            
            for module_title in data["modules"]:
                module = Module.objects.create(
                    program=program,
                    title=module_title,
                    order=data["modules"].index(module_title) + 1
                )
                
                # Scrape topic content (simplified example)
                response = requests.get(data["url"])
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract key sections - this will need customization
                sections = soup.select('.section-content')[:4]  
                for i, section in enumerate(sections):
                    Topic.objects.create(
                        module=module,
                        title=section.find('h2').text if section.find('h2') else f"Section {i+1}",
                        content=str(section),
                        order=i+1
                    )