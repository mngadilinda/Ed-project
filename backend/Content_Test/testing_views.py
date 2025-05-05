# backend/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .seed_math import LIBRETEXTS_MAP

@csrf_exempt
def load_libretexts(request):
    if request.method == 'POST':
        selected = request.POST.get('subjects', [])
        results = {}
        
        for subject in selected:
            if subject in LIBRETEXTS_MAP:
                # Call your import logic here
                results[subject] = "Loaded successfully"
        
        return JsonResponse({"status": "complete", "results": results})
    return JsonResponse({"error": "Invalid request"}, status=400)