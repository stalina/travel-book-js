/**
 * Données de test pour l'éditeur
 * À copier-coller dans la console du navigateur
 */

export const mockTrip = {
  id: 1,
  name: "Voyage en Europe du Sud",
  start_date: 1625097600, // 1er juillet 2021
  end_date: 1627776000,   // 1er août 2021
  cover_photo: {
    path: "paris.jpg",
    date: 1625097600
  },
  steps: [
    {
      id: 1,
      name: "Paris",
      description: "Visite de la capitale française avec ses monuments emblématiques : Tour Eiffel, Louvre, Arc de Triomphe",
      city: "Paris",
      country: "France",
      country_code: "FR",
      start_time: 1625097600,
      end_time: 1625356800,
      weather_condition: "sunny",
      weather_temperature: 25,
      latitude: 48.8566,
      longitude: 2.3522,
      lat: 48.8566,
      lon: 2.3522,
      slug: "paris"
    },
    {
      id: 2,
      name: "Lyon",
      description: "Découverte de la gastronomie lyonnaise et du vieux Lyon",
      city: "Lyon",
      country: "France",
      country_code: "FR",
      start_time: 1625443200,
      end_time: 1625702400,
      weather_condition: "cloudy",
      weather_temperature: 22,
      latitude: 45.7640,
      longitude: 4.8357,
      lat: 45.7640,
      lon: 4.8357,
      slug: "lyon"
    },
    {
      id: 3,
      name: "Marseille",
      description: "Ville portuaire avec le Vieux-Port et les calanques",
      city: "Marseille",
      country: "France",
      country_code: "FR",
      start_time: 1625788800,
      end_time: 1626048000,
      weather_condition: "sunny",
      weather_temperature: 28,
      latitude: 43.2965,
      longitude: 5.3698,
      lat: 43.2965,
      lon: 5.3698,
      slug: "marseille"
    },
    {
      id: 4,
      name: "Nice",
      description: "Côte d'Azur, promenade des Anglais et vieille ville",
      city: "Nice",
      country: "France",
      country_code: "FR",
      start_time: 1626134400,
      end_time: 1626393600,
      weather_condition: "sunny",
      weather_temperature: 30,
      latitude: 43.7102,
      longitude: 7.2620,
      lat: 43.7102,
      lon: 7.2620,
      slug: "nice"
    },
    {
      id: 5,
      name: "Monaco",
      description: "Principauté, casino et Grand Prix",
      city: "Monaco",
      country: "Monaco",
      country_code: "MC",
      start_time: 1626480000,
      end_time: 1626652800,
      weather_condition: "sunny",
      weather_temperature: 29,
      latitude: 43.7384,
      longitude: 7.4246,
      lat: 43.7384,
      lon: 7.4246,
      slug: "monaco"
    },
    {
      id: 6,
      name: "Gênes",
      description: "Port historique d'Italie, aquarium et vieux centre",
      city: "Gênes",
      country: "Italie",
      country_code: "IT",
      start_time: 1626739200,
      end_time: 1626998400,
      weather_condition: "partly_cloudy",
      weather_temperature: 27,
      latitude: 44.4056,
      longitude: 8.9463,
      lat: 44.4056,
      lon: 8.9463,
      slug: "genes"
    },
    {
      id: 7,
      name: "Florence",
      description: "Capitale de la Renaissance avec le Duomo et les Offices",
      city: "Florence",
      country: "Italie",
      country_code: "IT",
      start_time: 1627084800,
      end_time: 1627344000,
      weather_condition: "sunny",
      weather_temperature: 32,
      latitude: 43.7696,
      longitude: 11.2558,
      lat: 43.7696,
      lon: 11.2558,
      slug: "florence"
    },
    {
      id: 8,
      name: "Rome",
      description: "Ville éternelle : Colisée, Vatican, Fontaine de Trevi",
      city: "Rome",
      country: "Italie",
      country_code: "IT",
      start_time: 1627430400,
      end_time: 1627776000,
      weather_condition: "sunny",
      weather_temperature: 33,
      latitude: 41.9028,
      longitude: 12.4964,
      lat: 41.9028,
      lon: 12.4964,
      slug: "rome"
    }
  ]
};

// Instructions d'utilisation dans la console :
console.log(`
Pour charger ce voyage dans l'éditeur, copiez-collez :

const { useEditorStore } = await import('/src/stores/editor.store.ts');
const editorStore = useEditorStore();

// Importer mockTrip depuis ce fichier
const { mockTrip } = await import('/src/utils/mockData.ts');
editorStore.setTrip(mockTrip);

console.log('✅ Voyage chargé avec', mockTrip.steps.length, 'étapes');
`);
