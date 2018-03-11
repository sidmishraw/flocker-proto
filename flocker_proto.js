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
 * @last-modified Sat Mar 10 2018 21:08:58 GMT-0800 (PST)
 */

/**
 * The global list of all the swallows.
 * @type {Swallow[]}
 */
let swallows = [];

/**
 * Sets up the simulation.
 */
function setup() {
  createCanvas(400, 400);

  angleMode(DEGREES); // sets the angle mode to degrees
  rectMode(CENTER); // sets x,y co-ordinates for the retangle to be its CENTER
  imageMode(CENTER); // sets x,y co-ordinates for the image to be its CENTER

  // for (let x = 0; x < 100; x++) {
  //   swallows.push(new Swallow(random(50, 250), random(50, 250)));
  // }
}

// Draw loop
function draw() {
  clear();

  drawGrid(); // draw the grid for reference

  swallows.forEach(swallow => swallow.fly()); // render all the swallows
}

// draws a grid -- good for debugging the screen
function drawGrid() {
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
}

/**
 * Event listener for when the mouse button is released.
 * I add a Swallow to the flock.
 */
function mouseReleased() {
  swallows.push(new Swallow(0, 0));
}

/**
 * Swallow is a bird that will be flocking with its friends.
 *
 * @param {number} x The initial X spawn location of the Swallow.
 * @param {number} y The initial Y spawn location of the Swallow.
 */
function Swallow(x, y) {
  this.image = loadImage("./swallow-img.png"); // the Swallow itself.

  this.position = createVector(x, y); // position of the Swallow.
  this.velocity = createVector(0.003, 0.003); // the velocity of the Swallow.
  this.acceleration = createVector(0.0, 0.0); // the acceleration of the Swallow.

  this.maxForce = 0.03; // the maximum acceleration as per Daniel Shiffman's implementation
  this.maxSpeed = 2.0; // the maximum speed as per Daniel Shiffman's implementation

  /* global Matrix4x4 */
  /** @type {Matrix4x4} */
  this.tMatrix = new Matrix4x4(400, 400); // the swallow's transformation matrix

  this.tMatrix.scale2D(0.031, 0.031); // scale the image to 0.031 since it is very, very big!
}

/**
 * The swallow flies.
 */
Swallow.prototype.fly = function() {
  this.velocity.add(this.acceleration); // v = u + at (let the velocity get updated every tick).
  this.velocity.limit(this.maxspeed); // max speed limited.

  this.position.add(this.velocity); // s = vt, position changes with respect to the velocity.
  this.position.x = this.position.x % width;
  this.position.y = this.position.y % height;

  this.acceleration.mult(0); // reset the acceleration for each cycle.

  // console.log(`velocity = ${this.velocity}`);
  // console.log(`position = ${this.position}`);

  this.render(); // render the Swallow
};

/**
 * Applies a force to the Swallow.
 * @param {p5.Vector} force The force that will let each Swallow accelerate.
 * F = ma => a = F / m
 * Assuming each Swallow has same mass, then (a = F).
 */
Swallow.prototype.applyForce = function(force) {
  this.acceleration.add(force);
};

/**
 * Renders the Swallow.
 */
Swallow.prototype.render = function() {
  push(); // push the current matrix onto the stack

  this.tMatrix.translate2D(this.position.x, this.position.y); // translates with wraparound
  applyMatrix(...this.tMatrix.getParamsForApplying());

  image(this.image, 0, 0);

  pop(); // pop the current matrix from the stack, replacing it to the backed up matrix

  console.log(`position = ${JSON.stringify(this.tMatrix.getPosition())}`);
};
