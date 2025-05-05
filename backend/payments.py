# payments/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import hashlib
import urllib.parse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payfast_session(request):
    try:
        plan = request.data.get('plan')
        email = request.data.get('email')
        amount = request.data.get('amount')
        user_id = request.user.id
        
        # PayFast requires amount in cents
        amount_cents = int(float(amount) * 100)
        
        data = {
            'merchant_id': settings.PAYFAST_MERCHANT_ID,
            'merchant_key': settings.PAYFAST_MERCHANT_KEY,
            'return_url': f"{settings.FRONTEND_URL}/payment-success",
            'cancel_url': f"{settings.FRONTEND_URL}/payment-failed",
            'notify_url': f"{settings.BACKEND_URL}/api/payments/payfast-webhook",
            'name_first': request.user.first_name or '',
            'name_last': request.user.last_name or '',
            'email_address': email,
            'm_payment_id': str(user_id),
            'amount': str(amount),
            'item_name': f"Ed-Master {plan.capitalize()} Subscription",
            'item_description': f"Subscription for {plan} access",
            'custom_int1': user_id,
            'custom_str1': plan
        }

        # Generate signature
        signature_string = '&'.join([f"{key}={urllib.parse.quote_plus(str(value))}" 
                                   for key, value in data.items() if value])
        if settings.PAYFAST_PASSPHRASE:
            signature_string += f"&passphrase={settings.PAYFAST_PASSPHRASE}"
        signature = hashlib.md5(signature_string.encode()).hexdigest()
        data['signature'] = signature

        payment_url = f"{settings.PAYFAST_URL}/eng/process?{urllib.parse.urlencode(data)}"
        
        return JsonResponse({'payment_url': payment_url})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def payfast_webhook(request):
    if request.method == 'POST':
        try:
            # Verify the payment notification
            data = request.POST.dict()
            signature = data.pop('signature', None)
            
            # Reconstruct the signature
            param_string = '&'.join([
                f"{key}={urllib.parse.quote_plus(str(value))}" 
                for key, value in sorted(data.items()) 
                if value and key != 'signature'
            ])
            
            if settings.PAYFAST_PASSPHRASE:
                param_string += f"&passphrase={settings.PAYFAST_PASSPHRASE}"
                
            calculated_signature = hashlib.md5(param_string.encode()).hexdigest()
            
            if calculated_signature == signature:
                # Payment is valid, process it
                payment_status = data.get('payment_status', '').upper()
                user_id = data.get('custom_int1')
                plan = data.get('custom_str1')
                
                if payment_status == 'COMPLETE':
                    # Update user subscription in your database
                    # Example:
                    # user = User.objects.get(id=user_id)
                    # user.subscription_type = plan
                    # user.subscription_expiry = calculate_expiry_date(plan)
                    # user.save()
                    pass
                
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'error': 'Invalid signature'}, status=400)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)