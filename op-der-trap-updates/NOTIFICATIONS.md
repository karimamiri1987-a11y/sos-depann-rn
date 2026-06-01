# Notifications — Op der Trap

## 1. Rappels locaux (✅ en place)

Chaque réservation (table ou bowling) programme automatiquement, **sur le
téléphone du client**, deux rappels :

- **La veille à 18h00** (si la réservation est au moins le lendemain)
- **2h avant l'heure** de la réservation

Annuler ou modifier une réservation annule / replanifie les rappels.

### Activation (à faire une fois)

Dans le dossier du projet, lancer :

```bash
npx expo install expo-notifications
```

Puis relancer `npx expo start`. La première réservation demandera
l'autorisation d'envoyer des notifications.

> Tant que le package n'est pas installé, l'app fonctionne normalement —
> les rappels sont simplement désactivés (aucun plantage).

### Fonctionne où ?

- ✅ **Expo Go** (Android & iOS) : les rappels locaux fonctionnent.
- ✅ **Build de développement / production** : fonctionnent aussi.

---

## 2. Annonces du café (push à distance — pour plus tard)

Pour que le café envoie des messages à **tous les clients** (événement,
menu du jour, fermeture exceptionnelle…), il faut 3 choses :

### a) Abandonner Expo Go pour un build de dev

Depuis Expo SDK 53, les notifications **push à distance** ne fonctionnent
plus dans Expo Go sur Android. Il faut générer un build :

```bash
npx expo install expo-dev-client
eas build --profile development --platform android
```

(Compte Expo + EAS requis — gratuit pour commencer.)

### b) Récupérer et stocker les tokens push des clients

Dans `src/utils/notifications.js`, ajouter une fonction qui récupère le
token Expo de chaque appareil :

```js
export async function getPushToken() {
  if (!Notifications) return null;
  const granted = await ensurePermissions();
  if (!granted) return null;
  const { data } = await Notifications.getExpoPushTokenAsync({
    projectId: 'VOTRE_PROJECT_ID_EAS',
  });
  return data; // ex. ExponentPushToken[xxxxxxxx]
}
```

Ces tokens doivent être envoyés à un **serveur** (voir c) qui les stocke.

### c) Un petit serveur pour envoyer les messages

Le café a besoin d'un endroit où :
1. stocker la liste des tokens,
2. déclencher l'envoi (depuis une page d'admin ou un simple script).

L'envoi se fait via l'API push d'Expo (gratuite) :

```bash
curl -H "Content-Type: application/json" \
  -X POST https://exp.host/--/api/v2/push/send \
  -d '{
    "to": "ExponentPushToken[xxxx]",
    "title": "Op der Trap",
    "body": "Soirée bowling ce vendredi ! 🎳"
  }'
```

Options de serveur simples et peu coûteuses : un petit projet
Cloudflare Workers, Supabase Edge Function, ou un mini-serveur Node.

> C'est un chantier séparé (backend + build custom). Les rappels locaux
> du point 1 couvrent déjà le besoin le plus courant côté client.
