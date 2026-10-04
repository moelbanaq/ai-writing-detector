import { describe, expect, it } from 'vitest';
import { detectLanguage } from './detect-language.js';

describe('detectLanguage', () => {
  it('English text', () => {
    const result = detectLanguage('This is definitely an English text with enough words.');
    expect(result.primary).toBe('en');
  });
  it('Arabic text', () => {
    const result = detectLanguage('هذا نص عربي يحتوي على كلمات كافية للاختبار.');
    expect(result.primary).toBe('ar');
  });
  it('Mixed Arabic/English', () => {
    const result = detectLanguage('This is English و هذا عربي.');
    expect(result.mixedLanguage).toBe(true);
  });
  it('French text', () => {
    const result = detectLanguage('Le chat est sur la table. Les enfants jouent dans le jardin.');
    expect(result.primary).toBe('fr');
  });
  it('Spanish text', () => {
    const result = detectLanguage('El gato está en la mesa. Los niños juegan en el jardín.');
    expect(result.primary).toBe('es');
  });
  it('Unknown script', () => {
    const result = detectLanguage('%%%% **** &&&&');
    expect(['unknown', 'en']).toContain(result.primary);
  });
});
