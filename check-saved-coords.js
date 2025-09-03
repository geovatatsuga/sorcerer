// Script para recuperar coordenadas do localStorage
// Cole este código no console do navegador (F12 > Console)

console.log("=== VERIFICANDO COORDENADAS SALVAS ===");

// Verificar se existe coordenadas salvas
const savedCoords = localStorage.getItem('worldMapCoordinates');

if (savedCoords) {
    console.log("✅ Coordenadas encontradas no localStorage:");
    try {
        const parsed = JSON.parse(savedCoords);
        console.log(JSON.stringify(parsed, null, 2));
        
        console.log("\n=== CLIPPATH PARA CADA REGIÃO ===");
        Object.entries(parsed).forEach(([key, region]) => {
            console.log(`${key}: "${region.clipPath}"`);
        });
        
    } catch (e) {
        console.error("❌ Erro ao fazer parse:", e);
    }
} else {
    console.log("❌ Nenhuma coordenada salva encontrada no localStorage");
    console.log("💡 Verifique se você salvou no modo de edição anterior");
}

// Verificar todas as chaves do localStorage
console.log("\n=== TODAS AS CHAVES NO LOCALSTORAGE ===");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
}
