// Le "model" (souvent une interface) sert à décrire la forme des données JSON
// que le backend Spring Boot renvoie.
// -> Ça ne génère pas de code à l'exécution, c'est juste pour TypeScript (typage).



export interface Client {
    // id : identifiant unique en base (souvent Long côté Spring)
    id: number;


    // Champs métier (à adapter exactement aux noms renvoyés par l'API)
    nom: string;
    email: string;
    telephone: string;

    ordersCount?: number; // nombre de commandes
}