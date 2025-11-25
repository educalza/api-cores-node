const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = [
    '/hex_para_rgb',
    '/calcular_complementar',
    '/gerar_paleta_triadica',
    '/obter_nome_cor'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function logResult(testName, success, message = '') {
    totalTests++;
    if (success) {
        passedTests++;
        console.log(`[PASS] ${testName}`);
    } else {
        failedTests++;
        console.error(`[FAIL] ${testName} - ${message}`);
    }
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        http.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, body: data, error: e });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function runFunctionalTests() {
    console.log('\n--- Iniciando Testes Funcionais ---');

    // 1. Teste Básico HEX Válido (6 dígitos)
    try {
        const res = await makeRequest('/hex_para_rgb?hex=FF5733');
        logResult('HEX Válido (6 dígitos)', res.status === 200 && res.body.success === true && res.body.data.rgb === '255, 87, 51');
    } catch (e) { logResult('HEX Válido (6 dígitos)', false, e.message); }

    // 2. Teste Básico HEX Válido (3 dígitos)
    try {
        const res = await makeRequest('/hex_para_rgb?hex=F00');
        logResult('HEX Válido (3 dígitos)', res.status === 200 && res.body.success === true && res.body.data.rgb === '255, 0, 0');
    } catch (e) { logResult('HEX Válido (3 dígitos)', false, e.message); }

    // 3. Teste Case Insensitive
    try {
        const res = await makeRequest('/hex_para_rgb?hex=ff5733');
        logResult('HEX Case Insensitive', res.status === 200 && res.body.success === true);
    } catch (e) { logResult('HEX Case Insensitive', false, e.message); }

    // 4. Teste com Hash (#)
    try {
        // Nota: # deve ser encoded como %23 na URL, mas browsers/clientes as vezes mandam cru. 
        // Se mandarmos cru via http.get, pode dar problema no parsing do path. Vamos testar encoded.
        const res = await makeRequest('/hex_para_rgb?hex=%23FF5733');
        logResult('HEX com # (URL Encoded)', res.status === 200 && res.body.success === true);
    } catch (e) { logResult('HEX com # (URL Encoded)', false, e.message); }
}

async function runValidationTests() {
    console.log('\n--- Iniciando Testes de Validação ---');

    // 1. HEX Inválido (Tamanho errado)
    try {
        const res = await makeRequest('/hex_para_rgb?hex=12345');
        logResult('HEX Inválido (5 dígitos)', res.body.success === false, 'Deveria falhar com 5 dígitos');
    } catch (e) { logResult('HEX Inválido (5 dígitos)', false, e.message); }

    // 2. HEX Inválido (Caracteres inválidos)
    try {
        const res = await makeRequest('/hex_para_rgb?hex=ZZZZZZ');
        logResult('HEX Inválido (Letras Z)', res.body.success === false, 'Deveria falhar com caracteres não-hex');
    } catch (e) { logResult('HEX Inválido (Letras Z)', false, e.message); }

    // 3. Sem parâmetro HEX
    try {
        const res = await makeRequest('/hex_para_rgb');
        logResult('Sem parâmetro HEX', res.body.success === false, 'Deveria falhar sem parâmetro');
    } catch (e) { logResult('Sem parâmetro HEX', false, e.message); }
}

async function runFuzzingTests() {
    console.log('\n--- Iniciando Fuzzing (Entradas Aleatórias) ---');
    const iterations = 50;
    let crashes = 0;

    for (let i = 0; i < iterations; i++) {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        try {
            const res = await makeRequest(`/hex_para_rgb?hex=${randomString}`);
            if (res.status === 500) {
                console.error(`[CRASH] Input: ${randomString} causou erro 500`);
                crashes++;
            }
        } catch (e) {
            console.error(`[NETWORK ERROR] Input: ${randomString}`, e.message);
        }
    }

    logResult(`Fuzzing ${iterations} iterações`, crashes === 0, `${crashes} crashes detectados`);
}

async function runEdgeCaseTests() {
    console.log('\n--- Iniciando Testes de Casos de Borda ---');

    // 1. SQL Injection attempt (simples)
    try {
        const res = await makeRequest('/hex_para_rgb?hex=%27%20OR%201=1--');
        logResult('SQL Injection Probe', res.body.success === false || res.status === 200, 'Não deve quebrar o servidor');
    } catch (e) { logResult('SQL Injection Probe', false, e.message); }

    // 2. Script Injection (XSS)
    try {
        const res = await makeRequest('/hex_para_rgb?hex=%3Cscript%3Ealert(1)%3C/script%3E');
        logResult('XSS Probe', res.body.success === false, 'Deve rejeitar tags HTML');
    } catch (e) { logResult('XSS Probe', false, e.message); }

    // 3. Trailing Slash Bypass (Sem parametro)
    try {
        const res = await makeRequest('/hex_para_rgb/');
        // Se o middleware falhar em detectar que essa rota precisa de hex, vai passar para o handler
        // O handler vai tentar ler req.cleanHex (undefined) e estourar erro 500 ou erro tratado
        // O esperado seria 400 ou mensagem de "parametro obrigatorio", mas se o middleware for ignorado, pode dar 500.
        logResult('Trailing Slash sem Hex', res.body.success === false, 'Deve pedir parametro hex ou dar erro tratado');
        if (res.body.success === false && res.body.message.includes('Erro')) {
            console.log('   -> Detectado erro genérico (catch), indicando bypass do middleware de validação.');
        }
    } catch (e) { logResult('Trailing Slash sem Hex', false, e.message); }

    // 4. Array de Parametros (Poluição de parametros)
    try {
        // ?hex=FFF&hex=000 -> express transforma em array ['FFF', '000']
        // .toUpperCase() em array falha
        const res = await makeRequest('/hex_para_rgb?hex=FFF&hex=000');
        logResult('Parameter Pollution (Array)', res.status !== 500, 'Não deve dar Crash 500');
    } catch (e) { logResult('Parameter Pollution (Array)', false, e.message); }

    // 5. Case Sensitivity Bypass (Rota)
    try {
        // Express é case insensitive por padrão no roteamento, mas req.path preserva o case.
        // O middleware verifica 'hex_para_rgb', mas se chamarmos 'Hex_Para_Rgb', pode passar batido
        // e cair na rota que espera req.cleanHex.
        const res = await makeRequest('/Hex_Para_Rgb?hex=F00');
        logResult('Path Case Sensitivity Bypass', res.status === 200 && res.body.success === true, 'Deve funcionar ou ser validado corretamente');
        if (res.status === 500) {
            console.log('   -> Detectado Crash 500 (Middleware Bypass por Case Sensitivity)');
        }
    } catch (e) { logResult('Path Case Sensitivity Bypass', false, e.message); }
}

async function runConfigTests() {
    console.log('\n--- Iniciando Testes de Configuração/Segurança ---');

    // 1. CORS Headers
    try {
        const res = await makeRequest('/hex_para_rgb?hex=FFF');
        // Verifica se tem header Access-Control-Allow-Origin
        // Como usamos http.get simples, headers estão em res.headers (não exposto no wrapper atual, preciso ajustar wrapper ou confiar no body)
        // O wrapper retorna { status, body }. Vou ajustar makeRequest pra retornar headers se possivel ou checar comportamento.
        // Vou assumir que falha se não conseguir checar, mas o ideal é ver os headers.
        // Simplificação: Se não tem CORS configurado no server.js (eu li o código), então FALTA CORS.
        // Vou apenas logar como "Manual Check" ou tentar inferir.
        // Melhor: vou adicionar check de headers no makeRequest rapidinho.
    } catch (e) { }
}

async function main() {
    // Aguarda servidor subir se necessário (simulado aqui apenas rodando os testes)
    await runFunctionalTests();
    await runValidationTests();
    await runEdgeCaseTests();

    // CORS Check
    console.log('\n--- Verificação de CORS ---');
    try {
        const res = await makeRequest('/hex_para_rgb?hex=FFF');
        const hasCors = res.headers['access-control-allow-origin'];
        logResult('CORS Headers Present', !!hasCors, 'API pública deve ter CORS habilitado (*)');
    } catch (e) { logResult('CORS Headers Present', false, e.message); }

    await runFuzzingTests();

    console.log(`\n=== RESUMO ===`);
    console.log(`Total: ${totalTests}`);
    console.log(`Passou: ${passedTests}`);
    console.log(`Falhou: ${failedTests}`);

    if (failedTests > 0) process.exit(1);
}

main();
