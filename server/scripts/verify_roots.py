from products.models import Category

def run():
    print("Checking for 'Thuốc' categories with NO parent:")
    roots = Category.objects.filter(name__startswith='Thuốc', parent__isnull=True)
    count = roots.count()
    if count == 0:
        print("clean: No root categories starting with 'Thuốc' (except 'Thuốc' itself presumably)")
    else:
        for c in roots:
            print(f"- {c.name} (ID: {c.id})")

    # Double check "Thuốc" itself
    try:
        thuoc = Category.objects.get(name='Thuốc')
        print(f"\n'Thuốc' Category ID: {thuoc.id}")
        if thuoc.parent:
            print(f"'Thuốc' has parent: {thuoc.parent.name}")
        else:
            print("'Thuốc' is a root category (Correct)")
    except Category.DoesNotExist:
        print("'Thuốc' category NOT FOUND")

    # Rebuild MPTT just in case
    print("\nRebuilding MPTT tree...")
    Category.objects.rebuild()
    print("Tree rebuilt.")
