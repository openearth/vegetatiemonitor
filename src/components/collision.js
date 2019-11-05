import * as d3 from "d3";
// from example http://bl.ocks.org/rpgove/10603627

const xVar = 'x'
const yVar = 'y'


function makeForce(data, width, height) {
  var force = d3.forceSimulation(data)
      .size([width, height])
      .on("tick", tick)
      .charge(-1)
      .gravity(0)
      .chargeDistance(20);
  return force
}

function tick(e) {
  node.each(moveTowardDataPosition(e.alpha));

  if (checkbox.node().checked) node.each(collide(e.alpha));

  node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

function moveTowardDataPosition(alpha) {
  return function(d) {
    d.x += (x(d[xVar]) - d.x) * 0.1 * alpha;
    d.y += (y(d[yVar]) - d.y) * 0.1 * alpha;
  };
}

// Resolve collisions between nodes.
function collide(alpha) {
  var quadtree = d3.quadtree(data);
  return function(d) {
    var r = d.radius + radius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}


export {
  makeForce as force
}
