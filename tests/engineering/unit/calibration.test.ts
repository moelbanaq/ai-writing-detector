import { describe, expect, it } from 'vitest';
import { fitCalibration, evaluateCalibration, type LabeledSample } from '@ai-detector/core';

describe('Calibration Tools', () => {
  const dummySamples: LabeledSample[] = [
    {
      text: 'In today’s rapidly evolving digital landscape, artificial intelligence plays a crucial role in transforming various sectors. Furthermore, it is important to note that machine learning algorithms streamline workflows.',
      label: 1,
    },
    {
      text: 'Moreover, by leveraging vast amounts of data, these sophisticated systems can delve deep into complex patterns, thereby enhancing decision-making processes and fostering innovation.',
      label: 1,
    },
    {
      text: 'Additionally, organizations must navigate the ethical considerations and challenges associated with automated technologies to ensure sustainable and inclusive growth in this realm.',
      label: 1,
    },
    {
      text: 'It is worth noting that seamlessly integrating AI into existing infrastructure underscores the importance of a robust framework and comprehensive understanding.',
      label: 1,
    },
    {
      text: 'In conclusion, embracing technological advancement while maintaining rigorous standards is vital, paving the way for future human-AI collaboration and a testament to progress.',
      label: 1,
    },
    {
      text: 'We synthesized the zinc oxide nanoparticles using a modified sol-gel method. Specifically, 5.0 g of zinc acetate was dissolved in 100 mL of ethanol under magnetic stirring at 60 °C.',
      label: 0,
    },
    {
      text: 'After 30 minutes, 2.0 mL of aqueous ammonia was added dropwise until the pH reached 9.0. The solution was refluxed for 2 hours, resulting in a white precipitate that we filtered.',
      label: 0,
    },
    {
      text: 'The precipitate was washed three times with deionized water and ethanol, then dried at 80 °C overnight. Finally, calcination was performed in a muffle furnace at 500 °C for 3 hours.',
      label: 0,
    },
    {
      text: 'XRD patterns confirmed a hexagonal wurtzite crystal structure with characteristic peaks at 31.8°, 34.4°, and 36.3° corresponding to (100), (002), and (101) planes respectively.',
      label: 0,
    },
    {
      text: 'In our hands, manual injection caused slight retention time shifts of approximately 0.05 min across five replicate injections, which we resolved by calibrating the autosampler.',
      label: 0,
    },
  ];

  it('trains a calibration profile on labeled samples', () => {
    const profile = fitCalibration(dummySamples, { epochs: 100, learningRate: 0.1 });
    expect(profile).toBeDefined();
    expect(profile.version).toContain('trained');
    expect(typeof profile.intercept).toBe('number');
    expect(typeof profile.brierScore).toBe('number');
    expect(profile.trainingSamples).toBe(dummySamples.length);
  });

  it('evaluates calibration metrics accurately', () => {
    const profile = fitCalibration(dummySamples, { epochs: 100, learningRate: 0.1 });
    const evalResult = evaluateCalibration(profile, dummySamples);
    expect(evalResult).toBeDefined();
    expect(evalResult.n).toBe(dummySamples.length);
    expect(evalResult.accuracy).toBeGreaterThanOrEqual(0.7);
    expect(evalResult.brierScore).toBeLessThan(0.3);
    expect(evalResult.confusionMatrix).toBeDefined();
  });
});
