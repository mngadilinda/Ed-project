from django.core.cache import cache
from django.db.models import Count, Sum, Avg
from .models import LearningSession, TestResult

def get_learner_performance(learner):
    """Generate advanced analytics for a learner with caching"""
    cache_key = f"learner_analytics_{learner.id}"
    
    # Try to get cached results first
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return cached_data
    
    # 1. Get all test results for this learner (optimized query)
    test_results = TestResult.objects.filter(user=learner).select_related(
        'assessment', 
        'assessment__questions'
    )
    
    # 2. Time spent per module
    time_spent = LearningSession.objects.filter(
        user=learner
    ).values('module__title').annotate(
        total_hours=Sum('duration_hours')
    )
    
    # 3. Concept mastery
    concept_scores = test_results.values(
        'assessment__questions__concept_tags'
    ).annotate(
        avg_score=Avg('score'),
        attempt_count=Count('id')
    ).order_by('avg_score')
    
    # 4. Class comparison
    class_avg = 0
    if learner.enrollments.exists():
        program = learner.enrollments.first().program
        class_avg = TestResult.objects.filter(
            assessment__program=program
        ).exclude(user=learner).aggregate(
            avg_score=Avg('score')
        )['avg_score'] or 0

    # Prepare final results
    results = {
        'time_spent': list(time_spent),
        'concept_mastery': list(concept_scores),
        'class_comparison': {
            'learner_avg': test_results.aggregate(
                avg_score=Avg('score')
            )['avg_score'] or 0,
            'class_avg': class_avg
        }
    }
    
    # Cache the results
    cache.set(cache_key, results, timeout=3600)  # 1 hour cache
    
    return results