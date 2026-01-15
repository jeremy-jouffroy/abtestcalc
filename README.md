# A/B Test Calculator

A comprehensive A/B testing calculator with both **Frequentist** and **Bayesian** statistical approaches. This tool helps you plan, analyze, and optimize your experiments with statistical confidence.

## Features

### 🎯 Sample Size Calculator
- Determine required sample size for your test
- Calculate test duration based on daily traffic
- Account for Minimum Detectable Effect (MDE)
- Adjust for confidence level and statistical power
- Support for multiple variants

### 📊 Test Results Analyzer
Choose between two statistical approaches:

#### Frequentist Analysis
- P-value calculation
- Z-score
- Confidence intervals (95%)
- Relative uplift and absolute difference
- Clear statistical significance verdict

#### Bayesian Analysis
- Probability that variant B beats control A
- Expected loss calculations
- Credible intervals (95%)
- Median uplift estimation
- Monte Carlo simulation (configurable samples)
- Customizable priors (Beta distribution)

### 📈 Minimum Detectable Effect Calculator
- Calculate the smallest improvement you can reliably detect
- Based on your sample size and statistical parameters
- Helps set realistic test expectations

## Usage

Simply open `index.html` in your browser or visit the GitHub Pages deployment.

### Sample Size Planning
1. Enter your baseline conversion rate
2. Set the minimum detectable effect you want to detect
3. Choose confidence level and statistical power
4. Enter daily traffic
5. Click "Calculate Sample Size"

### Analyzing Results
1. Select Frequentist or Bayesian method
2. Enter visitors and conversions for both Control (A) and Variant (B)
3. For Bayesian: optionally adjust priors and Monte Carlo samples
4. Click "Analyze Results"

## Statistical Methods

### Frequentist Approach
Uses traditional hypothesis testing with p-values and confidence intervals. Best when you want a binary decision (significant or not significant) with controlled Type I error rate.

### Bayesian Approach
Provides probability distributions and expected losses. Better for:
- Understanding the magnitude of effects
- Making cost-benefit decisions
- Incorporating prior knowledge
- Getting intuitive probability statements

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/ (root)` folder
5. Save and wait for deployment

## Technical Details

### Frequentist Calculations
- Two-proportion z-test
- Pooled standard error
- Normal approximation for large samples

### Bayesian Calculations
- Beta-Binomial conjugate model
- Monte Carlo simulation using Beta random variables
- Gamma random number generation (Marsaglia-Tsang method)
- Expected loss calculation for decision making

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - feel free to use and modify for your needs.

## Credits

Inspired by various A/B testing calculators, built with a focus on providing both traditional frequentist and modern Bayesian approaches in a user-friendly interface.
