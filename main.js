(() => {
  'use strict';

  class Vec2 {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  class Vec3 {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    static add(a, b) {
      return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }
    static subtract(a, b) {
      return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }
    static multiply(a, b) {
      return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
    }
    static scale(a, b) {
      return new Vec3(a.x * b, a.y * b, a.z * b);
    }
    static normalize(a) {
      let length = Vec3.length(a);
      return new Vec3(a.x / length, a.y / length, a.z / length);
    }
    static dot(a, b) {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    static squaredLength(a) {
      return Vec3.dot(a, a);
    }
    static length(a) {
      return Math.sqrt(Vec3.squaredLength(a));
    }
    static pow(a, b) {
      return new Vec3(Math.pow(a.x, b), Math.pow(a.y, b), Math.pow(a.z, b));
    }
  }

  class Ray {
    constructor(origin, direction) {
      this.origin = origin;
      this.direction = direction;
    }
  }

  class Sphere {
    constructor(center, radius) {
      this.center = center;
      this.radius = radius;
    }
    intersectionPointWithRay(ray) {
      const V = Vec3.subtract(ray.origin, this.center);
      const B = Vec3.dot(V, ray.direction);
      const C = Vec3.squaredLength(V) - Math.pow(this.radius, 2);
      const D = Math.pow(B, 2) - C;
      if (D < 0) {
        return null;
      }
      const T1 = -1 * B + Math.sqrt(D);
      const T2 = -1 * B - Math.sqrt(D);
      if (T1 < 0 && T2 < 0) {
        return null;
      }
      const T = Math.min(T1, T2);
      if (T < 0) {
        return null;
      }
      return Vec3.scale(ray.direction, T);
    }
    normalForIntersectionPoint(point) {
      return Vec3.normalize(Vec3.subtract(point, this.center));
    }
  }

  class Light {
    constructor(position) {
      this.position = position;
    }
  }

  class Material {
    constructor(diffuse) {
      this.diffuse = diffuse;
    }
    getColor(light, intersectionPoint, normal) {
      const LIGHT_DIRECTION = Vec3.normalize(
        Vec3.subtract(light.position, intersectionPoint)
      );
      return Vec3.scale(this.diffuse, Vec3.dot(normal, LIGHT_DIRECTION));
    }
  }

  function traceRay(coordinate) {
    const sRGB_GAMUT = 1 / 2.2;
    const FOCAL_LENGTH = 0.028;
    const FILM_WIDTH = 0.036;
    const FILM_HEIGHT = 0.024;
    const CAMERA_POSITION = new Vec3(0, 0, 0);
    const SPHERE_CENTER = new Vec3(0, 0, -5);
    const SPHERE_RADIUS = 1.0;
    const SPHERE = new Sphere(SPHERE_CENTER, SPHERE_RADIUS);
    const LIGHT = new Light(new Vec3(-5, 5, 5));
    const MATERIAL = new Material(new Vec3(0.75, 0.75, 0.75));

    const RAY_DIRECTION = Vec3.normalize(
      new Vec3(FILM_WIDTH * coordinate.x, FILM_HEIGHT * coordinate.y, -FOCAL_LENGTH)
    );
    const RAY = new Ray(CAMERA_POSITION, RAY_DIRECTION);
    let color = new Vec3(0, 0, 0);

    // Rendering
    const INTERSECTION_POINT = SPHERE.intersectionPointWithRay(RAY);
    if (INTERSECTION_POINT !== null) {
      const NORMAL = SPHERE.normalForIntersectionPoint(INTERSECTION_POINT);
      color = MATERIAL.getColor(LIGHT, INTERSECTION_POINT, NORMAL);
    }
    // Gamut correction
    return Vec3.pow(color, sRGB_GAMUT);
  }

  window.addEventListener('DOMContentLoaded', () => {
    let c = canvas.getContext('2d');
    let image = c.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const COORDINATE = new Vec2(x / image.width - 0.5, -(y / image.height) + 0.5);
        const COLOR = traceRay(COORDINATE);
        // Set color
        const HEAD_INDEX = (y * image.width + x) * 4;
        image.data[HEAD_INDEX] = COLOR.x * 255;
        image.data[HEAD_INDEX + 1] = COLOR.y * 255;
        image.data[HEAD_INDEX + 2] = COLOR.z * 255;
        image.data[HEAD_INDEX + 3] = 255;
      }
    }
    c.putImageData(image, 0, 0);
  });
})();
