let rcolor = require('../rcolor');

describe('rcolor', () => {
  it('espera-se que sejam gerados cores corretas', () => {
    for (let i = 0; i < 100; i++) {
      expect(rcolor()).toMatch(/^\#[0-9a-f]{6}$/i);
    }
  });
});
