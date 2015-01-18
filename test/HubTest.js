var test = require('tape');
var sinon = require('sinon');
var Hub = require('../lib/Hub');

// generates fake connection
function createConn() {
  var conn = {
    'id': parseInt(Math.random() * 1000000 * Math.random(), 10)
    ,'remoteAddress': '127.0.0.' + parseInt(Math.random() * 128, 10)
    ,'remotePort': parseInt(Math.random() * 5000, 10)
    ,'write': sinon.spy()
    ,'on': sinon.spy()
    ,'close': sinon.spy()
  };
  return conn;
}

test('Hub: can add connection', function (t) {
    t.plan(8);

    var hub = new Hub();
    var conn = createConn();
    sinon.spy(hub, 'describe');
    sinon.spy(hub, 'send');
    t.equal(hub.connections.length, 0);

    hub.addConnection(conn);
    t.equal(hub.connections.length, 1);
    t.equal(conn.on.calledTwice, true);
    t.equal(conn.write.calledOnce, true);
    t.equal(hub.describe.calledOnce, true);
    t.equal(hub.send.calledOnce, true);

    t.equal(conn.on.calledWith('data', sinon.match.func), true);
    t.equal(conn.on.calledWith('close', sinon.match.func), true);
});

test('Hub: rejects more than 2 connections', function (t) {
    t.plan(5);

    var hub = new Hub();
    var conn1 = createConn();
    var conn2 = createConn();
    var conn3 = createConn();

    hub.addConnection(conn1);
    hub.addConnection(conn2);
    t.equal(hub.connections.length, 2);

    hub.addConnection(conn3);
    t.equal(hub.connections.length, 2);
    t.equal(hub.connections[0].remoteAddress, conn1.remoteAddress);
    t.equal(hub.connections[1].remoteAddress, conn2.remoteAddress);
    t.equal(conn3.close.calledOnce, true);
});

test('Hub: handles connection data event', function (t) {
    t.plan(2);

    var hub = new Hub();
    var conn = createConn();
    var message = {
      type: 'TEST'
      ,data: {
        testData: true
      }
    };
    sinon.spy(hub, 'broadcast');
    sinon.spy(hub, 'send');
    hub.addConnection(conn);

    // Call the function passed for data event callback
    conn.on.getCall(0).args[1](JSON.stringify(message));

    t.equal(hub.broadcast.calledOnce, true);
    t.equal(hub.send.calledOnce, true);
});

test('Hub: handles connection close event', function (t) {
    t.plan(3);

    var hub = new Hub();
    sinon.spy(hub, 'describe');
    var conn1 = createConn();
    var conn2 = createConn();
    hub.addConnection(conn1);
    hub.addConnection(conn2);

    // Fire close event on conn1
    conn1.on.getCall(1).args[1](null, conn1);

    t.equal(hub.describe.callCount, 3);
    t.equal(hub.connections.length, 1);
    t.equal(hub.connections[0].id, conn2.id);
});

test('Hub: can describe the room', function (t) {
    t.plan(8);

    var hub = new Hub();
    sinon.spy(hub, 'describe');
    var conn1 = createConn();
    var conn2 = createConn();

    hub.addConnection(conn1);
    hub.addConnection(conn2);

    t.equal(hub.describe.callCount, 2);
    t.equal(conn1.write.callCount, 2);
    t.equal(conn2.write.callCount, 1);

    var conn1desc1 = JSON.parse(conn1.write.getCall(0).args[0]);
    t.equal(conn1desc1.data.users.length, 0);

    var conn1desc2 = JSON.parse(conn1.write.getCall(1).args[0]);
    t.equal(conn1desc2.data.users.length, 1);
    t.equal(conn1desc2.data.users[0].id, conn2.id);

    var conn2desc1 = JSON.parse(conn2.write.getCall(0).args[0]);
    t.equal(conn2desc1.data.users.length, 1);
    t.equal(conn2desc1.data.users[0].id, conn1.id);

});
