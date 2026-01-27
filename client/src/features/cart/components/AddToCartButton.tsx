"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "../stores/cart.store";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
    productId: number;
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    showIcon?: boolean;
    text?: string;
    quantity?: number;
}

export function AddToCartButton({ 
    productId, 
    className, 
    variant = "default", 
    size = "default",
    showIcon = true,
    text = "Thêm vào giỏ",
    quantity = 1
}: AddToCartButtonProps) {
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a link
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để mua hàng");
            router.push("/auth/login");
            return;
        }

        setIsLoading(true);
        await addToCart(productId, quantity);
        setIsLoading(false);
    };

    return (
        <Button 
            variant={variant} 
            size={size} 
            className={className}
            onClick={handleAddToCart}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : showIcon && (
                <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            {text}
        </Button>
    );
}
