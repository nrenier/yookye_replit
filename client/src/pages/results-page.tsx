import { useEffect, useState } from "react";
import { useSearchParams } from "@/hooks/use-search-params";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layouts/main-layout";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getJobStatus, getJobResult } from "@/lib/api";

// Enum per lo stato del job
enum JobStatus {
  STARTED = "STARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR"
}

export default function ResultsPage() {
  const { toast } = useToast();
  const { jobId } = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState<JobStatus | null>(null);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling per lo stato del job
  useEffect(() => {
    if (!jobId) {
      setError("ID processo di ricerca mancante");
      setLoading(false);
      return;
    }

    // Funzione per controllare lo stato del job
    const checkJobStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        setCurrentStatus(response.status);

        if (response.status === JobStatus.COMPLETED) {
          // Se il job è completato, carica i risultati
          clearInterval(pollingInterval!);
          setPollingInterval(null);
          loadResults();
        } else if (response.status === JobStatus.ERROR) {
          // Se c'è un errore nel job
          clearInterval(pollingInterval!);
          setPollingInterval(null);
          setError("Si è verificato un errore durante l'elaborazione della richiesta.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Errore nel controllo dello stato:", err);
        clearInterval(pollingInterval!);
        setPollingInterval(null);
        setError("Impossibile controllare lo stato della richiesta. Riprova più tardi.");
        setLoading(false);
      }
    };

    // Funzione per caricare i risultati
    const loadResults = async () => {
      try {
        const data = await getJobResult(jobId);
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error("Errore nel caricamento dei risultati:", err);
        setError("Si è verificato un errore durante il caricamento dei risultati. Riprova più tardi.");
        setLoading(false);

        toast({
          title: "Errore",
          description: "Impossibile caricare i risultati della ricerca",
          variant: "destructive",
        });
      }
    };

    // Controlla lo stato immediatamente
    checkJobStatus();

    // Imposta il polling ogni 5 secondi
    const interval = window.setInterval(checkJobStatus, 5000);
    setPollingInterval(interval);

    // Pulizia al dismount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [jobId, toast]);

  // Funzione per forzare il refresh dei risultati
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJobResult(jobId);
      setResults(data);
      setLoading(false);
    } catch (err) {
      console.error("Errore nel refresh dei risultati:", err);
      setError("Si è verificato un errore durante l'aggiornamento dei risultati.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-16 w-16 animate-spin text-yookve-red" />
          <p className="mt-4 text-xl">Elaborazione dei risultati in corso...</p>
          <p className="text-gray-500 mb-4">
            {currentStatus === JobStatus.STARTED && "Stiamo avviando la ricerca..."}
            {currentStatus === JobStatus.RUNNING && "Stiamo analizzando le tue preferenze per trovare il viaggio perfetto."}
            {!currentStatus && "Connessione al server in corso..."}
          </p>
          <p className="text-sm text-gray-400">Job ID: {jobId}</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button onClick={handleRefresh} className="mt-4">
              Riprova
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Se non ci sono risultati o l'oggetto result non è nel formato atteso
  if (!results || (!results.accomodation && !results.packages)) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16">
          <Alert className="mb-6">
            <AlertTitle>Nessun risultato</AlertTitle>
            <AlertDescription>Non abbiamo trovato proposte di viaggio in base alle tue preferenze. Prova a modificare i criteri di ricerca.</AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button onClick={() => window.location.href = "/preferences"} className="mt-4">
              Nuova ricerca
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Determina la fonte dei dati (API esterna o mock interno)
  const packages = results.packages || [];
  const accommodation = results.accomodation;
  const experiences = results.esperienze || [];

  return (
    <MainLayout>
      <div className="container mx-auto py-16">
        <h1 className="text-3xl font-bold mb-8">Soluzioni di viaggio consigliate</h1>
        <p className="text-gray-600 mb-8">
          In base alle tue preferenze, abbiamo selezionato queste soluzioni di viaggio che potrebbero interessarti.
        </p>

        <Separator className="my-8" />

        {/* Visualizza l'alloggio se disponibile dall'API esterna */}
        {accommodation && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Alloggio consigliato</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{accommodation.name}</h3>
                <p className="text-gray-600 mb-4">{accommodation.description || accommodation.address}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500">Valutazione:</span> 
                    <span className="ml-2 font-semibold">{accommodation.rating} / 10</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span> 
                    <span className="ml-2 font-semibold">{accommodation.kind}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stelle:</span> 
                    <span className="ml-2 font-semibold">{accommodation.star_rating || "N/A"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-yookve-red">€{accommodation.daily_prices}</span>
                    <span className="text-gray-500 ml-1">/ giorno</span>
                  </div>
                  <div className="text-sm">
                    {accommodation.breakfast_included && <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Colazione inclusa</span>}
                    {accommodation.free_cancellation && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Cancellazione gratuita</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualizza esperienze se disponibili dall'API esterna */}
        {experiences && experiences.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Esperienze consigliate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{exp.name}</h3>
                    <p className="text-gray-600 mb-4">{exp.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-semibold text-yookve-red">€{exp.price}</span>
                      </div>
                      <div className="text-sm text-gray-500">{exp.duration}</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-500">Valutazione:</span> 
                      <span className="ml-2 font-semibold">{exp.rating} / 5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualizza pacchetti se disponibili (dal mock o API interna) */}
        {packages && packages.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pacchetti di viaggio correlati</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-semibold text-yookve-red">€{pkg.price}</span>
                        <span className="text-gray-500 ml-1">/ persona</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.duration || (pkg.durationDays ? `${pkg.durationDays} giorni` : '')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}