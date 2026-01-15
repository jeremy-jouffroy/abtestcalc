// Tab switching functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Remove active class from all tabs and buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Method selector for analysis tab
document.querySelectorAll('input[name="method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const bayesianInputs = document.getElementById('bayesian-inputs');
        if (e.target.value === 'bayesian') {
            bayesianInputs.style.display = 'block';
        } else {
            bayesianInputs.style.display = 'none';
        }
    });
});

// Multi-variant management
let variantCounter = 1;
const variantLabels = ['B', 'C', 'D', 'E'];

function updateConversionRates() {
    document.querySelectorAll('.variant-visitors-input').forEach(input => {
        const variantId = input.dataset.variant;
        const visitorsInput = input;
        const conversionsInput = document.querySelector(`.variant-conversions-input[data-variant="${variantId}"]`);
        const rateDisplay = document.querySelector(`.variant-rate-display[data-variant="${variantId}"]`);

        if (visitorsInput && conversionsInput && rateDisplay) {
            const visitors = parseFloat(visitorsInput.value) || 0;
            const conversions = parseFloat(conversionsInput.value) || 0;
            const rate = visitors > 0 ? (conversions / visitors * 100) : 0;
            rateDisplay.textContent = rate.toFixed(2) + '%';
        }
    });
}

// Real-time conversion rate updates
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('variant-visitors-input') ||
        e.target.classList.contains('variant-conversions-input')) {
        updateConversionRates();
    }
});

function addVariant() {
    const container = document.getElementById('variants-container');
    const testVariants = container.querySelectorAll('.test-variant');

    if (testVariants.length >= 4) { // Control + 4 variants = 5 total
        alert('Maximum of 5 variants (including control)');
        return;
    }

    variantCounter++;
    const variantId = variantCounter;
    const variantLabel = variantLabels[testVariants.length] || `V${testVariants.length + 1}`;

    const variantHTML = `
        <div class="variant-input test-variant" data-variant-id="${variantId}">
            <div class="variant-header">
                <h3>Variant ${variantLabel}</h3>
                <button class="remove-variant-btn" onclick="removeVariant(${variantId})" title="Remove variant">✕</button>
            </div>
            <div class="input-group">
                <label>Visitors</label>
                <input type="number" class="variant-visitors-input" data-variant="${variantId}" min="0" value="10000">
            </div>
            <div class="input-group">
                <label>Conversions</label>
                <input type="number" class="variant-conversions-input" data-variant="${variantId}" min="0" value="500">
            </div>
            <div class="conversion-rate">
                <span>Conversion Rate: <strong class="variant-rate-display" data-variant="${variantId}">5.00%</strong></span>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', variantHTML);
    updateVariantCount();
    updateConversionRates();
}

function removeVariant(variantId) {
    const variant = document.querySelector(`.test-variant[data-variant-id="${variantId}"]`);
    if (variant) {
        variant.remove();
        updateVariantCount();
    }
}

function updateVariantCount() {
    const container = document.getElementById('variants-container');
    const allVariants = container.querySelectorAll('.variant-input');
    const count = allVariants.length;

    document.getElementById('variant-count').textContent = count;

    const addBtn = document.getElementById('add-variant-btn');
    if (count >= 5) {
        addBtn.disabled = true;
        addBtn.textContent = '✓ Max Variants';
    } else {
        addBtn.disabled = false;
        addBtn.textContent = '+ Add Variant';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateConversionRates();
    updateVariantCount();
});

// Statistical functions
function zScore(alpha) {
    // Z-scores for common confidence levels
    const zScores = {
        0.90: 1.645,
        0.95: 1.96,
        0.99: 2.576
    };
    return zScores[alpha] || 1.96;
}

function normalCDF(z) {
    // Approximation of cumulative distribution function
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - prob : prob;
}

// Sample Size Calculator
function calculateSampleSize() {
    const baselineConv = parseFloat(document.getElementById('baseline-conv').value) / 100;
    const mde = parseFloat(document.getElementById('mde').value) / 100;
    const confidence = parseFloat(document.getElementById('confidence').value);
    const power = parseFloat(document.getElementById('power').value);
    const variants = parseInt(document.getElementById('variants').value);
    const dailyTraffic = parseInt(document.getElementById('daily-traffic').value);

    // Calculate variant conversion rate
    const variantConv = baselineConv * (1 + mde);

    // Z-scores for confidence and power
    const zAlpha = zScore(confidence);
    const zBeta = zScore(power);

    // Sample size calculation using formula
    const pooledP = (baselineConv + variantConv) / 2;
    const numerator = Math.pow(zAlpha + zBeta, 2) * pooledP * (1 - pooledP);
    const denominator = Math.pow(variantConv - baselineConv, 2);
    const samplePerVariant = Math.ceil(numerator / denominator);

    const totalSample = samplePerVariant * variants;
    const duration = Math.ceil(totalSample / dailyTraffic);

    // Display results
    document.getElementById('sample-per-variant').textContent = samplePerVariant.toLocaleString();
    document.getElementById('total-sample').textContent = totalSample.toLocaleString();
    document.getElementById('duration').textContent = `${duration} days`;
    document.getElementById('expected-variant-conv').textContent = (variantConv * 100).toFixed(2) + '%';

    // Check recommendations
    checkRecommendations(samplePerVariant, duration);

    document.getElementById('sample-results').style.display = 'block';
}

// Check recommendations and update UI
function checkRecommendations(samplePerVariant, duration) {
    // Recommendation 1: Minimum 5000 visitors per variant
    const recVisitors = document.getElementById('rec-visitors');
    const hasMinVisitors = samplePerVariant >= 5000;
    updateRecommendation(recVisitors, hasMinVisitors);

    // Recommendation 2: Minimum 14 days
    const recMinDuration = document.getElementById('rec-min-duration');
    const hasMinDuration = duration >= 14;
    updateRecommendation(recMinDuration, hasMinDuration);

    // Recommendation 3: Maximum 42 days
    const recMaxDuration = document.getElementById('rec-max-duration');
    const hasMaxDuration = duration <= 42;
    updateRecommendation(recMaxDuration, hasMaxDuration);
}

function updateRecommendation(element, isValid) {
    const icon = element.querySelector('.rec-icon');
    if (isValid) {
        icon.textContent = '✓';
        icon.className = 'rec-icon valid';
        element.className = 'recommendation-item valid';
    } else {
        icon.textContent = '✗';
        icon.className = 'rec-icon invalid';
        element.className = 'recommendation-item invalid';
    }
}

// Analyze Test - Frequentist approach
function analyzeTestFrequentist(controlVisitors, controlConversions, variantVisitors, variantConversions) {
    const pControl = controlConversions / controlVisitors;
    const pVariant = variantConversions / variantVisitors;

    // Pooled proportion
    const pPooled = (controlConversions + variantConversions) / (controlVisitors + variantVisitors);

    // Standard error
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / controlVisitors + 1 / variantVisitors));

    // Z-score
    const z = (pVariant - pControl) / se;

    // P-value (two-tailed)
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));

    // Relative uplift
    const uplift = ((pVariant - pControl) / pControl) * 100;

    // Absolute difference
    const absDiff = (pVariant - pControl) * 100;

    // 95% Confidence interval
    const seUplift = Math.sqrt((pControl * (1 - pControl) / controlVisitors) + (pVariant * (1 - pVariant) / variantVisitors));
    const marginOfError = 1.96 * seUplift;
    const ciLower = ((pVariant - marginOfError - pControl) / pControl) * 100;
    const ciUpper = ((pVariant + marginOfError - pControl) / pControl) * 100;

    // Display results
    document.getElementById('uplift').textContent = uplift.toFixed(2) + '%';
    document.getElementById('abs-diff').textContent = absDiff.toFixed(2) + ' percentage points';
    document.getElementById('p-value').textContent = pValue.toFixed(4);
    document.getElementById('z-score').textContent = z.toFixed(3);
    document.getElementById('conf-interval').textContent = `[${ciLower.toFixed(2)}%, ${ciUpper.toFixed(2)}%]`;

    // Verdict
    const verdict = document.getElementById('verdict');
    const variantLabel = window.analyzedVariantLabel || 'Variant B';
    if (pValue < 0.05) {
        if (uplift > 0) {
            verdict.innerHTML = `✅ <strong>Statistically Significant!</strong> ${variantLabel} performs better than Control A.`;
            verdict.className = 'verdict success';
        } else {
            verdict.innerHTML = `❌ <strong>Statistically Significant!</strong> ${variantLabel} performs worse than Control A.`;
            verdict.className = 'verdict danger';
        }
    } else {
        verdict.innerHTML = '⚠️ <strong>Not Statistically Significant.</strong> The difference could be due to chance. Consider running the test longer.';
        verdict.className = 'verdict warning';
    }

    document.getElementById('frequentist-results').style.display = 'block';
    document.getElementById('bayesian-results').style.display = 'none';
}

// Bayesian analysis with Beta distribution
function betaRandom(alpha, beta) {
    // Generate beta-distributed random variable using gamma distributions
    const gamma1 = gammaRandom(alpha, 1);
    const gamma2 = gammaRandom(beta, 1);
    return gamma1 / (gamma1 + gamma2);
}

function gammaRandom(shape, scale) {
    // Marsaglia and Tsang method for gamma distribution
    if (shape < 1) {
        return gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
        let x, v;
        do {
            x = normalRandom();
            v = 1 + c * x;
        } while (v <= 0);

        v = v * v * v;
        const u = Math.random();

        if (u < 1 - 0.0331 * x * x * x * x) {
            return d * v * scale;
        }

        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
            return d * v * scale;
        }
    }
}

function normalRandom() {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function analyzeTestBayesian(controlVisitors, controlConversions, variantVisitors, variantConversions) {
    const priorAlpha = parseFloat(document.getElementById('prior-alpha').value);
    const priorBeta = parseFloat(document.getElementById('prior-beta').value);
    const samples = parseInt(document.getElementById('monte-carlo-samples').value);

    // Posterior parameters (Beta distribution)
    const controlAlpha = priorAlpha + controlConversions;
    const controlBeta = priorBeta + (controlVisitors - controlConversions);
    const variantAlpha = priorAlpha + variantConversions;
    const variantBeta = priorBeta + (variantVisitors - variantConversions);

    // Monte Carlo simulation
    let bBeatsA = 0;
    const upliftSamples = [];
    const lossIfA = [];
    const lossIfB = [];

    for (let i = 0; i < samples; i++) {
        const controlSample = betaRandom(controlAlpha, controlBeta);
        const variantSample = betaRandom(variantAlpha, variantBeta);

        if (variantSample > controlSample) {
            bBeatsA++;
        }

        const uplift = ((variantSample - controlSample) / controlSample) * 100;
        upliftSamples.push(uplift);

        // Expected loss calculations
        lossIfA.push(Math.max(0, variantSample - controlSample));
        lossIfB.push(Math.max(0, controlSample - variantSample));
    }

    const probBBeatsA = (bBeatsA / samples) * 100;

    // Calculate statistics
    upliftSamples.sort((a, b) => a - b);
    const medianUplift = upliftSamples[Math.floor(samples * 0.5)];
    const credibleLower = upliftSamples[Math.floor(samples * 0.025)];
    const credibleUpper = upliftSamples[Math.floor(samples * 0.975)];

    const avgLossA = lossIfA.reduce((a, b) => a + b, 0) / samples;
    const avgLossB = lossIfB.reduce((a, b) => a + b, 0) / samples;

    // Display results
    document.getElementById('prob-b-beats-a').textContent = probBBeatsA.toFixed(2) + '%';
    document.getElementById('expected-loss-a').textContent = (avgLossA * 100).toFixed(4) + ' pp';
    document.getElementById('expected-loss-b').textContent = (avgLossB * 100).toFixed(4) + ' pp';
    document.getElementById('bayes-uplift').textContent = medianUplift.toFixed(2) + '%';
    document.getElementById('credible-interval').textContent = `[${credibleLower.toFixed(2)}%, ${credibleUpper.toFixed(2)}%]`;

    // Verdict
    const verdict = document.getElementById('bayes-verdict');
    const variantLabel = window.analyzedVariantLabel || 'Variant B';
    if (probBBeatsA > 95) {
        verdict.innerHTML = `✅ <strong>Strong Evidence!</strong> There's a ${probBBeatsA.toFixed(1)}% probability that ${variantLabel} is better than Control A.`;
        verdict.className = 'verdict success';
    } else if (probBBeatsA > 90) {
        verdict.innerHTML = `⚠️ <strong>Moderate Evidence.</strong> There's a ${probBBeatsA.toFixed(1)}% probability that ${variantLabel} is better. Consider collecting more data.`;
        verdict.className = 'verdict warning';
    } else if (probBBeatsA < 50) {
        verdict.innerHTML = `❌ <strong>Control A is likely better.</strong> There's only a ${probBBeatsA.toFixed(1)}% probability that ${variantLabel} is better.`;
        verdict.className = 'verdict danger';
    } else {
        verdict.innerHTML = `⚠️ <strong>Inconclusive.</strong> There's a ${probBBeatsA.toFixed(1)}% probability that ${variantLabel} is better. Collect more data for a clear decision.`;
        verdict.className = 'verdict warning';
    }

    document.getElementById('frequentist-results').style.display = 'none';
    document.getElementById('bayesian-results').style.display = 'block';
}

function analyzeTest() {
    // Collect control data
    const controlInput = document.querySelector('.variant-visitors-input[data-variant="control"]');
    const controlConvInput = document.querySelector('.variant-conversions-input[data-variant="control"]');

    if (!controlInput || !controlConvInput) {
        alert('Control variant data is missing!');
        return;
    }

    const controlVisitors = parseInt(controlInput.value);
    const controlConversions = parseInt(controlConvInput.value);

    // Collect all test variants
    const testVariants = [];
    document.querySelectorAll('.test-variant').forEach(variant => {
        const variantId = variant.dataset.variantId;
        const visitorsInput = variant.querySelector('.variant-visitors-input');
        const conversionsInput = variant.querySelector('.variant-conversions-input');

        if (visitorsInput && conversionsInput) {
            const visitors = parseInt(visitorsInput.value);
            const conversions = parseInt(conversionsInput.value);

            testVariants.push({
                id: variantId,
                visitors: visitors,
                conversions: conversions,
                label: variant.querySelector('h3').textContent
            });
        }
    });

    // Validation
    if (controlConversions > controlVisitors) {
        alert('Control conversions cannot exceed control visitors!');
        return;
    }

    for (let v of testVariants) {
        if (v.conversions > v.visitors) {
            alert(`${v.label} conversions cannot exceed visitors!`);
            return;
        }
    }

    if (testVariants.length === 0) {
        alert('Please add at least one test variant!');
        return;
    }

    const method = document.querySelector('input[name="method"]:checked').value;

    // Find the best performing variant (highest conversion rate)
    let bestVariant = testVariants[0];
    let bestConversionRate = testVariants[0].conversions / testVariants[0].visitors;

    for (let i = 1; i < testVariants.length; i++) {
        const convRate = testVariants[i].conversions / testVariants[i].visitors;
        if (convRate > bestConversionRate) {
            bestConversionRate = convRate;
            bestVariant = testVariants[i];
        }
    }

    // Store which variant is being analyzed for display purposes
    window.analyzedVariantLabel = bestVariant.label;

    // Update the analysis header
    const titleElement = document.getElementById('analyzed-variant-title');
    if (testVariants.length === 1) {
        titleElement.textContent = `Analyzing: ${bestVariant.label} vs Control A`;
    } else {
        titleElement.textContent = `Analyzing Best Performer: ${bestVariant.label} vs Control A (${(bestConversionRate * 100).toFixed(2)}% conversion)`;
    }

    // Analyze the best performing variant against control
    if (method === 'frequentist') {
        analyzeTestFrequentist(controlVisitors, controlConversions, bestVariant.visitors, bestVariant.conversions);
    } else {
        analyzeTestBayesian(controlVisitors, controlConversions, bestVariant.visitors, bestVariant.conversions);
    }

    document.getElementById('analysis-results').style.display = 'block';
}
