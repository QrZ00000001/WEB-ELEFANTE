document.addEventListener('DOMContentLoaded', () => {

    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const targetInput = document.getElementById('target-input');
    const targetLabel = document.getElementById('target-label');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const calcModeRadios = document.querySelectorAll('input[name="calcMode"]');

    // Outputs
    const resVal2 = document.getElementById('res-val-2');
    const resLabel2 = document.getElementById('res-label-2');
    const calcDetails = document.getElementById('calc-details');
    const totalPriceEl = document.getElementById('total-price');

    // Canvas y Visualización eliminados

    // --- Performance Optimization: Debounce ---
    let calculateTimeout;
    function debouncedCalculate() {
        clearTimeout(calculateTimeout);
        calculateTimeout = setTimeout(() => {
            calculate();
        }, 50);
    }

    // --- Business Logic ---
    function calculate() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const calcMode = document.querySelector('input[name="calcMode"]:checked').value;
        
        const w = parseFloat(widthInput.value.replace(',', '.')) || 0;
        const h = parseFloat(heightInput.value.replace(',', '.')) || 0;
        const targetValue = parseFloat(targetInput.value.replace(',', '.')) || 0;
        
        // Pliego fijo de 45x115
        const sheetW = 45;
        const sheetH = 115;

        // Actualización de Labels según modo
        if (calcMode === 'qty') {
            targetLabel.textContent = 'Cantidad de Adhesivos';
            resLabel2.textContent = 'm² Necesarios';
        } else {
            targetLabel.textContent = 'Cantidad de m² (Ej: 1.5)';
            resLabel2.textContent = 'Stickers a Entregar';
        }

        if (w <= 0 || h <= 0) {
            resetOutputs();
            return;
        }

        // 1. Geometría
        const margin = mode === 'unitario' ? 1.0 : 0.4;
        const adjW = w + margin;
        const adjH = h + margin;

        const fit1_W = Math.floor(sheetW / adjW);
        const fit1_H = Math.floor(sheetH / adjH);
        const total1 = Math.max(0, fit1_W * fit1_H);

        const fit2_W = Math.floor(sheetW / adjH);
        const fit2_H = Math.floor(sheetH / adjW);
        const total2 = Math.max(0, fit2_W * fit2_H);

        let unitsPerSheet, isRotated;
        if (total1 >= total2) {
            unitsPerSheet = total1; isRotated = false;
        } else {
            unitsPerSheet = total2; isRotated = true;
        }

        // 2. Lógica de Cantidades
        const sheetAreaM2 = (sheetW * sheetH) / 10000; // 0.5175 m2
        const unitsPerM2 = Math.floor(unitsPerSheet / sheetAreaM2);
        
        let m2Needed = 0;
        let totalStickers = 0;

        if (calcMode === 'qty') {
            totalStickers = targetValue;
            m2Needed = unitsPerM2 > 0 ? (totalStickers / unitsPerM2) : 0;
            m2Needed = Math.ceil(m2Needed * 2) / 2; // Redondea hacia arriba en intervalos de 0.5
            
            resVal2.textContent = m2Needed.toFixed(2); // M2 suele llevar decimales
        } else {
            m2Needed = targetValue;
            m2Needed = Math.ceil(m2Needed * 2) / 2; // Redondea hacia arriba en intervalos de 0.5
            totalStickers = Math.floor(m2Needed * unitsPerM2);
            
            animateNumber(resVal2, totalStickers);
        }

        // 3. Lógica de Precios
        // --- TABLA DE PRECIOS (Modificar aquí los valores reales) ---
        // Valor base (m²) de impresión Normal (Material Blanco + Ninguna terminación)
        const PRECIO_BASE_ROLLO = 1000; 
        const PRECIO_BASE_UNITARIO = 1000;
        
        // Valores extra por m² según Material (se suman al precio base)
        const RECARGO_MATERIAL = {
            'blanco': 0, // El base ya es blanco
            'tornasol': 1000,
            'fotoluminiscente': 1000,
            'transparente': 1000
        };

        // Valores extra por m² según Terminación (se suman al precio base)
        const RECARGO_TERMINACION = {
            'nada': 0,
            'barniz': 1000,
            'blanco': 1000,
            'blanco_barniz': 1000
        };
        // -------------------------------------------------------------

        // El mínimo de pedido es 0.5 m2 para el cobro
        const m2Cobrar = Math.max(0.5, m2Needed);

        const materialValue = document.getElementById('material-type').value;
        const finishValue = document.getElementById('finish-type').value;
        
        // Calcular precio de 1 m² con las opciones actuales
        let precioPorM2 = (mode === 'unitario') ? PRECIO_BASE_UNITARIO : PRECIO_BASE_ROLLO;
        precioPorM2 += RECARGO_MATERIAL[materialValue] || 0;
        precioPorM2 += RECARGO_TERMINACION[finishValue] || 0;

        const totalEstimado = m2Cobrar * precioPorM2;

        // Actualizar UI del precio
        totalPriceEl.textContent = '$' + Math.round(totalEstimado).toLocaleString('es-CL');

        calcDetails.innerHTML = `
            ${isRotated ? 'Rotado 90° para optimizar' : 'Posición normal'}<br>
            Medida real: ${adjW.toFixed(1)} x ${adjH.toFixed(1)} cm
        `;
    }

    function resetOutputs() {
        resVal2.textContent = '0';
        totalPriceEl.textContent = '$0';
        calcDetails.textContent = 'Ingresa medidas para calcular';
    }

    function animateNumber(element, target) {
        let current = parseInt(element.textContent) || 0;
        const start = current;
        const range = target - start;
        if (range === 0) { element.textContent = target; return; }
        const duration = 400;
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            element.textContent = Math.floor(start + range * progress);
            if (progress < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    const materialTypeSelect = document.getElementById('material-type');
    const finishTypeSelect = document.getElementById('finish-type');

    // Observers
    const allInputs = [
        widthInput, heightInput, targetInput, materialTypeSelect, finishTypeSelect
    ];

    allInputs.forEach(input => {
        input.addEventListener('input', debouncedCalculate);
    });
    
    modeRadios.forEach(radio => radio.addEventListener('change', debouncedCalculate));
    calcModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            targetInput.value = '';
            debouncedCalculate();
        });
    });

    window.addEventListener('resize', debouncedCalculate);
    window.addEventListener('load', calculate); // Ensure final layout is correct
    
    requestAnimationFrame(() => {
        calculate();
    });
});
