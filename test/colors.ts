
import { Color } from '../src/colors';
import { assert } from 'chai';
import { pipe } from '../src/index';

describe('Color#color2str', function () {

  it('returns proper RGBA string for a valid example', function () {
    assert.equal(Color.color2str([23, 137, 55, .07]), 'rgba(23, 137, 55, 0.07)');
  });

});

describe('Color#luminosity', function () {

  it('converts 128, 128, 128 to half luminosity', function () {
    assert.deepEqual(Color.luminosity(0.5, [128, 128, 128, 1]), [64, 64, 64, 1]);
  });

  it('converts 128, 128, 128 to + 1/2 luminosity', function () {
    assert.deepEqual(Color.luminosity(1.5, [128, 128, 128, 1]), [192, 192, 192, 1]);
  });

  it('does not overflow to negative values', function () {
    assert.deepEqual(Color.luminosity(0, [128, 128, 128, 1]), [0, 0, 0, 1]);
  });

  it('does not accept negative values', function () {
    assert.throws(function () {
      Color.luminosity(-3, [10, 10, 10, 1]);
    });
  });

});

describe('Color#hsl2Rgb', function () {

  it('converts a sample color with known result', function () {
    const [r, g, b] = Color.hsl2Rgb([0.5, 0.5, 0.5]);
    assert.equal(r, 64);
    assert.equal(g, 191);
    assert.equal(b, 191);
  });

  it('converts another sample color with known result', function () {
    const [r, g, b] = Color.hsl2Rgb([0.036, 0.23, 0.23]);
    assert.equal(r, 72);
    assert.equal(g, 51);
    assert.equal(b, 45);
  });

  it('converts white', function () {
    const [r, g, b] = Color.hsl2Rgb([1, 1, 1]);
    assert.equal(r, 255);
    assert.equal(g, 255);
    assert.equal(b, 255);
  });

  it('converts black', function () {
    const [r, g, b] = Color.hsl2Rgb([0, 0, 0]);
    assert.equal(r, 0);
    assert.equal(g, 0);
    assert.equal(b, 0);
  });


  it('converts pure red', function () {
    const [r, g, b] = Color.hsl2Rgb([0, 1, 0.5]);
    assert.equal(r, 255);
    assert.equal(g, 0);
    assert.equal(b, 0);
  });

  it('converts pure green', function () {
    const [r, g, b] = Color.hsl2Rgb([0.3333, 1, 0.5]);
    assert.equal(r, 0);
    assert.equal(g, 255);
    assert.equal(b, 0);
  });

});


describe('Color#hsl', function () {

  it('converts a color', function() {
    const [h, s, l] = Color.rgb2Hsl([210, 120, 80, 1]);
    assert.closeTo(h, 0.05, 0.005);
    assert.closeTo(s, 0.59, 0.005);
    assert.closeTo(l, 0.57, 0.005);
  });

  it('converts pure red', function() {
    const [h, s, l] = Color.rgb2Hsl([255, 0, 0, 1]);
    assert.closeTo(h, 0, 0.001);
    assert.closeTo(s, 1, 0.005);
    assert.closeTo(l, 0.5, 0.005);
  });

  it('converts pure green', function() {
    const [h, s, l] = Color.rgb2Hsl([0, 255, 0, 1]);
    assert.closeTo(h, 0.33, 0.005);
    assert.closeTo(s, 1, 0.005);
    assert.closeTo(l, 0.5, 0.005);
  });

  it('converts black', function() {
    const [h, s, l] = Color.rgb2Hsl([0, 0, 0, 1]);
    assert.closeTo(h, 0, 0.005);
    assert.closeTo(s, 0, 0.005);
    assert.closeTo(l, 0, 0.005);
  });

});

describe('Color pipeability', function () {

  it('allows piping color operations together', function () {
    const x = pipe(
      '#58D68D',
      Color.importColor(0.7),
      Color.luminosity(1.5),
      Color.color2str()
    );
    assert.equal(x, 'rgba(132, 255, 212, 0.7)');
  });

});