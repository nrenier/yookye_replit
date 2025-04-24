import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertPreference } from "@shared/schema";
import { Redirect, useLocation } from "wouter";
import { categories } from "@/data/categories";
import { destinations } from "@/data/destinations";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  destination: z.string().min(1, { message: "Seleziona una destinazione" }),
  specificCity: z.string().optional(),
  departureDate: z.string().min(1, { message: "Seleziona una data di partenza" }),
  returnDate: z.string().min(1, { message: "Seleziona una data di ritorno" }),
  adults: z.string().min(1, { message: "Seleziona il numero di adulti" }),
  children: z.string().min(1, { message: "Seleziona il numero di bambini" }),
  infants: z.string().min(1, { message: "Seleziona il numero di neonati" }),
  interests: z.array(z.string()).min(1, { message: "Seleziona almeno un interesse" }).max(3, { message: "Seleziona al massimo 3 interessi" }),
  accommodationType: z.string().min(1, { message: "Seleziona un tipo di alloggio" }),
  starRating: z.string().min(1, { message: "Seleziona una categoria di stelle" }),
  transportType: z.string().min(1, { message: "Seleziona un tipo di trasporto" }),
  departureCity: z.string().optional(),
  budget: z.string().min(1, { message: "Seleziona un budget" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PreferenceForm() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [redirect, setRedirect] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      specificCity: "",
      departureDate: "",
      returnDate: "",
      adults: "1",
      children: "0",
      infants: "0",
      interests: [],
      accommodationType: "",
      starRating: "",
      transportType: "",
      departureCity: "",
      budget: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert string values to numbers where needed
      const preferenceData: InsertPreference = {
        destination: data.destination,
        specificCity: data.specificCity,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
        adults: parseInt(data.adults),
        children: parseInt(data.children),
        infants: parseInt(data.infants),
        interests: data.interests,
        accommodationType: data.accommodationType,
        starRating: data.starRating,
        transportType: data.transportType,
        departureCity: data.departureCity,
        budget: data.budget,
        userId: 0, // This will be set by the server
      };
      
      const res = await apiRequest("POST", "/api/preferences", preferenceData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferenze salvate",
        description: "Le tue preferenze sono state salvate con successo",
      });
      setRedirect(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (redirect) {
    return <Redirect to="/results" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-8">
        {/* Destinazione e Date */}
        <div className="mb-8">
          <h3 className="font-montserrat font-semibold text-xl mb-4 pb-2 border-b border-gray-200">
            Destinazione e Date
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinazione</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una destinazione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinations.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          {destination.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specificCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città specifica (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Roma, Firenze, Venezia..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data di partenza</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data di ritorno</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Viaggiatori */}
        <div className="mb-8">
          <h3 className="font-montserrat font-semibold text-xl mb-4 pb-2 border-b border-gray-200">
            Viaggiatori
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adulti</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bambini (2-12 anni)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="infants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neonati (0-2 anni)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Interessi */}
        <div className="mb-8">
          <h3 className="font-montserrat font-semibold text-xl mb-4 pb-2 border-b border-gray-200">
            I tuoi interessi
          </h3>
          <p className="text-sm text-gray-600 mb-4">Seleziona le categorie che ti interessano di più (max 3)</p>
          
          <FormField
            control={form.control}
            name="interests"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="interests"
                      render={({ field }) => {
                        return (
                          <FormItem
                            className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-yookve-light cursor-pointer"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, category.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== category.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="ml-2 font-normal cursor-pointer">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Alloggio */}
        <div className="mb-8">
          <h3 className="font-montserrat font-semibold text-xl mb-4 pb-2 border-b border-gray-200">
            Tipo di alloggio preferito
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="accommodationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria di alloggio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Qualsiasi">Qualsiasi</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="B&B">B&B</SelectItem>
                      <SelectItem value="Agriturismo">Agriturismo</SelectItem>
                      <SelectItem value="Appartamento">Appartamento</SelectItem>
                      <SelectItem value="Resort">Resort</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="starRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria stelle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Qualsiasi">Qualsiasi</SelectItem>
                      <SelectItem value="3 stelle">3 stelle</SelectItem>
                      <SelectItem value="4 stelle">4 stelle</SelectItem>
                      <SelectItem value="5 stelle">5 stelle</SelectItem>
                      <SelectItem value="Lusso">Lusso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Trasporto */}
        <div className="mb-8">
          <h3 className="font-montserrat font-semibold text-xl mb-4 pb-2 border-b border-gray-200">
            Trasporto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="transportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferenza di trasporto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Includi trasporto">Includi trasporto</SelectItem>
                      <SelectItem value="Solo voli">Solo voli</SelectItem>
                      <SelectItem value="Solo treni">Solo treni</SelectItem>
                      <SelectItem value="Auto a noleggio">Auto a noleggio</SelectItem>
                      <SelectItem value="Nessun trasporto">Nessun trasporto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="departureCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città di partenza (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Milano, Roma, Napoli..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Budget */}
        <div className="mb-8">
          <h3 className="font-montserrat font-semibold text-xl mb-4 pb-2 border-b border-gray-200">
            Budget
          </h3>
          <div>
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget per persona</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Economico (fino a €500)">Economico (fino a €500)</SelectItem>
                      <SelectItem value="Medio (€500 - €1000)">Medio (€500 - €1000)</SelectItem>
                      <SelectItem value="Premium (€1000 - €2000)">Premium (€1000 - €2000)</SelectItem>
                      <SelectItem value="Lusso (€2000+)">Lusso (€2000+)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            type="submit" 
            className="bg-yookve-red hover:bg-red-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Genera Proposte
          </Button>
        </div>
      </form>
    </Form>
  );
}
