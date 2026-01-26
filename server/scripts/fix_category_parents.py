from products.models import Category

def run():
    try:
        # 1. Fix "Thuốc" group
        try:
            thuoc_parent = Category.objects.get(name='Thuốc')
            print(f"Found parent 'Thuốc': {thuoc_parent.id}")
            
            # Find all potential children
            child_candidates = Category.objects.filter(name__startswith='Thuốc ').exclude(id=thuoc_parent.id)
            
            for child in child_candidates:
                if not child.parent: # Only fix if no parent currently
                    child.parent = thuoc_parent
                    child.save()
                    print(f"  -> Assigned '{child.name}' to parent 'Thuốc'")
                else:
                    print(f"  -> '{child.name}' already has parent: {child.parent.name}")
                    
        except Category.DoesNotExist:
            print("Parent category 'Thuốc' not found!")
        
        # Verify result
        print("\nVerification:")
        thuoc_children = Category.objects.filter(parent__name='Thuốc')
        print(f"Children of 'Thuốc': {thuoc_children.count()}")
        for c in thuoc_children:
            print(f" - {c.name}")

    except Exception as e:
        print(f"Error: {e}")
