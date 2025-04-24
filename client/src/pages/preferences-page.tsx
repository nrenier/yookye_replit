import MainLayout from "@/components/layouts/main-layout";
import PreferenceForm from "@/components/preference-form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function PreferencesPage() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <MainLayout>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-montserrat font-bold text-3xl mb-2 text-center">Le tue preferenze di viaggio</h2>
            <p className="text-center text-gray-600 mb-10">Dicci cosa ti piace e creeremo proposte su misura per te</p>
            
            <PreferenceForm />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
