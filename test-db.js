const pool = require('./src/config/database'); // Importe le pool de connexion depuis database.js

async function testConnection() { // Déclare une fonction asynchrone pour tester la connexion

    try { // Commence le bloc qui peut générer une erreur

        const [rows] = await pool.query('SELECT 1 AS test'); // Exécute une requête SQL simple pour tester MySQL

        console.log('✅ Connexion à MySQL réussie !'); // Affiche un message si la connexion fonctionne

        console.log(rows); // Affiche le résultat retourné par MySQL

    } catch (error) { // Capture l'erreur si quelque chose ne fonctionne pas

        console.error('❌ Échec de la connexion à MySQL :'); // Affiche un message indiquant l'échec

       console.error(error); // Affiche toutes les informations détaillées de l'erreur

    } finally { // Exécute ce bloc que la connexion réussisse ou échoue

        await pool.end(); // Ferme toutes les connexions du pool

    } // Fin du bloc finally

} // Fin de la fonction testConnection

testConnection(); // Appelle la fonction pour lancer le test