from .models import Cart


def cart(request):
    """Context processor для кошика"""
    cart_data = {
        'cart_items_count': 0,
        'cart_total': 0,
        'cart': None,
    }
    
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            cart_data['cart'] = cart
            cart_data['cart_items_count'] = cart.total_items
            cart_data['cart_total'] = cart.total_price
        except Cart.DoesNotExist:
            pass
    
    return cart_data
