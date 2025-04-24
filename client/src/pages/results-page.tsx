import { useState, useEffect } from "react";
import { useSearchParams } from "@/hooks/use-search-params";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { toast } = useToast();

  const [status, setStatus] = useState<string>("LOADING");
  const [message, setMessage] = useState<string>("Stiamo elaborando la tua richiesta...");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkJobStatus = async () => {
    try {
      if (!jobId) {
        setStatus("ERROR");
        setMessage("ID ricerca non trovato. Torna alla pagina principale e riprova.");
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/api/search/${jobId}`);
      const jobStatus = response.data.status;

      if (jobStatus === "COMPLETED") {
        setStatus("COMPLETED");
        // La ricerca è completa, ottieni i risultati
        getResults();
      } else if (jobStatus === "ERROR") {
        setStatus("ERROR");
        setMessage("Si è verificato un errore durante l'elaborazione della richiesta.");
        setLoading(false);
      } else {
        // Continua a controllare lo stato ogni 3 secondi
        setTimeout(checkJobStatus, 3000);
      }
    } catch (error) {
      console.error("Errore durante il controllo dello stato:", error);
      setStatus("ERROR");
      setMessage("Errore durante il controllo dello stato della ricerca.");
      setLoading(false);
    }
  };

  const getResults = async () => {
    try {
      const response = await apiClient.get(`/api/search/${jobId}/result`);
      setResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Errore durante il recupero dei risultati:", error);
      setStatus("ERROR");
      setMessage("Errore durante il recupero dei risultati.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Avvia il controllo dello stato
    checkJobStatus();

    // Pulisci il timer quando il componente viene smontato
    return () => {
      // cleanup if needed
    };
  }, [jobId]);

  // Visualizza un loader durante l'elaborazione
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold text-center mb-2">Ricerca in corso</h2>
        <p className="text-center text-gray-600 max-w-md">
          Stiamo cercando le migliori opzioni per il tuo viaggio. Potrebbe volerci qualche istante...
        </p>
      </div>
    );
  }

  // Visualizza un messaggio di errore
  if (status === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-center mb-2">Si è verificato un errore</h2>
        <p className="text-center text-gray-600 max-w-md mb-6">{message}</p>
        <Button onClick={() => window.location.href = "/"}>
          Torna alla home
        </Button>
      </div>
    );
  }

  // Visualizza i risultati
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-center mb-8">
        <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
        <h1 className="text-3xl font-bold">Risultati della ricerca</h1>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{result.accomodation?.name || "Alloggio trovato"}</CardTitle>
              <CardDescription>
                {result.accomodation?.address || "Indirizzo non disponibile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{result.accomodation?.description || "Nessuna descrizione disponibile"}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold">Tipologia:</p>
                  <p>{result.accomodation?.kind || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Stelle:</p>
                  <p>{result.accomodation?.star_rating || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Prezzo giornaliero:</p>
                  <p>€ {result.accomodation?.daily_prices || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Valutazione:</p>
                  <p>{result.accomodation?.rating || "N/A"}/10</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {result.accomodation?.free_cancellation && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                    Cancellazione gratuita
                  </span>
                )}
                {result.accomodation?.breakfast_included && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                    Colazione inclusa
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Prenota ora</Button>
            </CardFooter>
          </Card>

          {result.esperienze && result.esperienze.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mt-8 mb-4">Esperienze consigliate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.esperienze.map((esperienza: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{esperienza.name}</CardTitle>
                      <CardDescription>{esperienza.duration}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{esperienza.description}</p>
                      <div className="flex justify-between">
                        <span className="font-semibold">€ {esperienza.price}</span>
                        <span>Valutazione: {esperienza.rating}/5</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Maggiori informazioni</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}