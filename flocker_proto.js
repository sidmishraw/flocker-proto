/**
 * flocker_proto.js
 * @author Sidharth Mishra
 * @description Flocker prototype.
 * @created Thu Mar 08 2018 14:24:34 GMT-0800 (PST)
 * @copyright  BSD 3-Clause License
 *
 * Copyright (c) 2018, Sidharth Mishra
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *  contributors may be used to endorse or promote products derived from
 *  this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @last-modified Sun Mar 11 2018 18:33:43 GMT-0700 (PDT)
 */

/** Some helpful constants*/
/** @type {number} */
const MAX_WRAP_AROUND_WIDTH = 1024; //640;

/** @type {number} */
const MAX_WRAP_AROUND_HEIGHT = 800; //360;

/** @type {number} */
const MAX_VELOCITY = 2.0;

/** @type {number} */
const MAX_ACCELERATION = 0.03;

/** @type {Flocker} */
const flocker = new Flocker();

/**
 * Sets up the simulation.
 */
function setup() {
  createCanvas(MAX_WRAP_AROUND_WIDTH, MAX_WRAP_AROUND_HEIGHT);

  angleMode(DEGREES); // sets the angle mode to degrees
  rectMode(CENTER); // sets x,y co-ordinates for the retangle to be its CENTER
  imageMode(CENTER); // sets x,y co-ordinates for the image to be its CENTER

  // start out with 100 Swallows for the simulation
  for (let x = 0; x < 100; x++) {
    flocker.addSwallow(random(MAX_WRAP_AROUND_WIDTH), random(MAX_WRAP_AROUND_HEIGHT));
  }
}

/**
 * Draw loop.
 */
function draw() {
  clear();
  // flocker.drawGrid();
  flocker.simulate();
}

/**
 * Event listener for when the mouse button is released.
 * I add a Swallow to the flock.
 */
function mouseReleased() {
  flocker.addSwallow(mouseX, mouseY);
}

/**
 * The Flocker app instance.
 */
function Flocker() {
  /**
   * The global list of all the swallows.
   * @type {Swallow[]}
   */
  this.swallows = [];
}

/**
 * Adds a Swallow to the flocker simulation.
 * @param {number} x The initial X coordinate of the Swallow.
 * @param {number} y The initial Y coordinate of the Swallow.
 */
Flocker.prototype.addSwallow = function(x, y) {
  this.swallows.push(new Swallow(x, y));
};

/**
 * Runs the Flocker simulation.
 */
Flocker.prototype.simulate = function() {
  this.swallows.forEach(swallow => swallow.fly());
};

/**
 * Draws a grid -- good for debugging the screen
 */
Flocker.prototype.drawGrid = function drawGrid() {
  stroke("#000000");
  fill(120);

  for (var x = -width; x < width; x += 40) {
    line(x, -height, x, height);
    text(x, x + 1, 12);
  }

  for (var y = -height; y < height; y += 40) {
    line(-width, y, width, y);
    text(y, 1, y + 12);
  }
};

/**
 * Swallow is a bird that will be flocking with its friends.
 *
 * @param {number} x The initial X spawn location of the Swallow.
 * @param {number} y The initial Y spawn location of the Swallow.
 */
function Swallow(x, y) {
  this.image = loadImage("./swallow-img.png"); // the Swallow itself.

  const theta = random(360.0); // generate a random angle for the direction of the Swallow

  /* global Matrix4x4 */
  /** @type {Matrix4x4}
   * This 4x4 matrix is responsible for Swallow's position, angle, and size.
   * Intialized to an identity matrix.
   */
  this.transformMatrix = new Matrix4x4(MAX_WRAP_AROUND_WIDTH, MAX_WRAP_AROUND_HEIGHT);

  this.velocity = createVector(Math.cos(theta), Math.sin(theta)); // the velocity of the Swallow.
  this.acceleration = createVector(0.0, 0.0); // the acceleration of the Swallow.

  this.transformMatrix.scale2D(0.0322, 0.0322); // scale the image to 0.031 since it is very, very big!
  this.transformMatrix.rRotate2D(this.velocity.heading() + 90.0); // rotate
  this.transformMatrix.translate2D(x, y); // translate to the starting point

  this.maxAcceleration = MAX_ACCELERATION; // the maximum acceleration as per Daniel Shiffman's implementation
  this.maxVelocity = MAX_VELOCITY; // the maximum speed as per Daniel Shiffman's implementation
}

/**
 * @internal
 * Changes the direction of the Swallow to match it's velocity's direction.
 */
Swallow.prototype.changeDirection = function() {
  this.transformMatrix.rRotate2D(0.1);
};

/**
 * The swallow flies.
 */
Swallow.prototype.fly = function() {
  this.velocity.add(this.acceleration); // v = u + at (let the velocity get updated every tick).
  this.velocity.limit(this.maxVelocity); // max speed upper bounded.

  this.transformMatrix.translate2D(this.velocity.x, this.velocity.y); // translates with wrap-around
  this.transformMatrix.rRotate2D(this.velocity.heading() + 90.0);

  this.acceleration.mult(0); // reset the acceleration for each cycle.

  this.render(); // render the Swallow
};

/**
 * Applies a force to the Swallow.
 * @param {p5.Vector} force The force that will let each Swallow accelerate.
 * F = ma => a = F / m
 * Assuming each Swallow has same unit mass, then (a = F).
 */
Swallow.prototype.applyForce = function(force) {
  this.acceleration.add(force);
};

/**
 * Renders the Swallow.
 */
Swallow.prototype.render = function() {
  push(); // push the current matrix onto the stack

  applyMatrix(...this.transformMatrix.getParamsForApplying());

  image(this.image, 0, 0);

  pop(); // pop the current matrix from the stack, replacing it to the backed up matrix
};
