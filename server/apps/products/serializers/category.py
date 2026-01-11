"""
Category serializers for CRUD operations.
"""
from rest_framework import serializers
from products.models import Category, Product


class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category list"""
    children_count = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()
    level = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'parent', 'parent_name', 'is_active', 'level',
            'children_count', 'product_count',
            'created_at', 'updated_at'
        ]

    def get_children_count(self, obj):
        return obj.get_children().count()

    def get_product_count(self, obj):
        return Product.objects.filter(category=obj, status='ACTIVE').count()

    def get_parent_name(self, obj):
        return obj.parent.name if obj.parent else None


class CategoryDetailSerializer(serializers.ModelSerializer):
    """Full serializer for category detail with tree info"""
    children = serializers.SerializerMethodField()
    parent_info = serializers.SerializerMethodField()
    ancestors = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    total_product_count = serializers.SerializerMethodField()
    level = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'parent', 'parent_info', 'is_active', 'level',
            'full_path', 'ancestors', 'children',
            'product_count', 'total_product_count',
            'created_at', 'updated_at'
        ]

    def get_children(self, obj):
        children = obj.get_children().filter(is_active=True)
        return CategoryListSerializer(children, many=True).data

    def get_parent_info(self, obj):
        if obj.parent:
            return {
                'id': str(obj.parent.id),
                'name': obj.parent.name,
                'slug': obj.parent.slug
            }
        return None

    def get_ancestors(self, obj):
        ancestors = obj.get_ancestors()
        return [
            {'id': str(a.id), 'name': a.name, 'slug': a.slug}
            for a in ancestors
        ]

    def get_full_path(self, obj):
        return obj.get_full_path()

    def get_product_count(self, obj):
        """Products directly in this category"""
        return Product.objects.filter(category=obj, status='ACTIVE').count()

    def get_total_product_count(self, obj):
        """Products in this category and all descendants"""
        descendants = obj.get_descendants(include_self=True)
        return Product.objects.filter(
            category__in=descendants,
            status='ACTIVE'
        ).count()


class CategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a category"""
    
    class Meta:
        model = Category
        fields = [
            'name', 'slug', 'description', 'image', 
            'parent', 'is_active'
        ]
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
        }

    def validate_parent(self, value):
        """Validate parent category exists and is active"""
        if value and not value.is_active:
            raise serializers.ValidationError("Parent category must be active")
        return value

    def validate_name(self, value):
        """Validate category name is unique within same parent"""
        parent = self.initial_data.get('parent')
        qs = Category.objects.filter(name__iexact=value, parent=parent)
        
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError(
                "A category with this name already exists under the same parent"
            )
        return value


class CategoryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a category"""
    
    class Meta:
        model = Category
        fields = [
            'name', 'slug', 'description', 'image', 
            'parent', 'is_active'
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'name': {'required': False},
        }

    def validate_parent(self, value):
        """Prevent setting parent to self or descendant"""
        if self.instance:
            if value and value.pk == self.instance.pk:
                raise serializers.ValidationError("Category cannot be its own parent")
            
            if value and value in self.instance.get_descendants():
                raise serializers.ValidationError(
                    "Cannot set a descendant category as parent"
                )
        return value

    def validate_name(self, value):
        """Validate category name is unique within same parent"""
        if not value:
            return value
            
        parent = self.initial_data.get('parent', self.instance.parent_id if self.instance else None)
        qs = Category.objects.filter(name__iexact=value, parent=parent)
        
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError(
                "A category with this name already exists under the same parent"
            )
        return value


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer for full category tree (recursive)"""
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    level = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'is_active', 'level', 'product_count', 'children'
        ]

    def get_children(self, obj):
        children = obj.get_children()
        if self.context.get('active_only', True):
            children = children.filter(is_active=True)
        return CategoryTreeSerializer(
            children, many=True, context=self.context
        ).data

    def get_product_count(self, obj):
        descendants = obj.get_descendants(include_self=True)
        return Product.objects.filter(
            category__in=descendants,
            status='ACTIVE'
        ).count()
