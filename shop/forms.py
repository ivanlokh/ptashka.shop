from django import forms
from .models import Review


class ProductSearchForm(forms.Form):
    """Форма пошуку товарів"""
    search = forms.CharField(
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Пошук товарів...',
            'id': 'search-input'
        }),
        label='Пошук'
    )
    
    category = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'}),
        label='Категорія'
    )
    
    brand = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'}),
        label='Бренд'
    )
    
    min_price = forms.DecimalField(
        required=False,
        min_value=0,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Мін. ціна'
        }),
        label='Мінімальна ціна'
    )
    
    max_price = forms.DecimalField(
        required=False,
        min_value=0,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Макс. ціна'
        }),
        label='Максимальна ціна'
    )
    
    sort_by = forms.ChoiceField(
        choices=[
            ('', 'Сортування'),
            ('newest', 'Новинки'),
            ('price_asc', 'Ціна: від низької до високої'),
            ('price_desc', 'Ціна: від високої до низької'),
            ('name', 'Назва'),
        ],
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'}),
        label='Сортування'
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Динамічно заповнюємо категорії
        from .models import Category, Brand
        
        category_choices = [('', 'Всі категорії')]
        category_choices.extend([
            (cat.id, cat.name) for cat in Category.objects.filter(is_active=True)
        ])
        self.fields['category'].choices = category_choices
        
        brand_choices = [('', 'Всі бренди')]
        brand_choices.extend([
            (brand.id, brand.name) for brand in Brand.objects.filter(is_active=True)
        ])
        self.fields['brand'].choices = brand_choices


class ReviewForm(forms.ModelForm):
    """Форма відгуку про товар"""
    
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment']
        widgets = {
            'rating': forms.RadioSelect(choices=[
                (1, '1 зірка'),
                (2, '2 зірки'),
                (3, '3 зірки'),
                (4, '4 зірки'),
                (5, '5 зірок'),
            ]),
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Заголовок відгуку'
            }),
            'comment': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Ваш відгук про товар...'
            }),
        }
        labels = {
            'rating': 'Оцінка',
            'title': 'Заголовок',
            'comment': 'Коментар',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['rating'].required = True
        self.fields['comment'].required = True
