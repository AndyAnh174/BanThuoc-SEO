import { MainLayout } from "@/src/features/layout";
import { ProfileForm } from "@/src/features/profile";

export default function ProfilePage() {
    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <ProfileForm />
            </div>
        </MainLayout>
    );
}
