var fondoJuego;
var nave;
var cursores;
var tiempoBala = 0;
var tiempoDisparoEnemigo = 0;
var botonDisparo;
var enemigos;
var balasEnemigos;
var score = 0;
var scoreText;
var vidas = 3;
var vidasText;
var nivel = 1;
var nivelText;
var musicaFondo;
var sonidoDisparoJugador;
var sonidoDisparoEnemigo;
var sonidoExplosion;
var sonidoColision;
var mensajeFinal;

var juego = new Phaser.Game(370, 550, Phaser.CANVAS, "escena");

var estadoInicio = {
  preload: function () {
    juego.load.image("fondoInicio", "img/titulo.avif");
  },
  create: function () {
    var fondoInicio = juego.add.sprite(0, 0, "fondoInicio");
    var textoInicio = juego.add.text(
      juego.world.centerX,
      juego.world.centerY,
      "Space Shooter\nPor [Ian Hansen]\n\nPresiona ESPACIO para comenzar",
      { font: "20px Arial", fill: "#ffffff", align: "center" }
    );
    textoInicio.anchor.setTo(0.5);
    var teclaEspacio = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    teclaEspacio.onDown.addOnce(this.iniciarJuego, this);
  },
  iniciarJuego: function () {
    juego.state.start("principal");
  },
};

var estadoPrincipal = {
  preload: function () {
    juego.load.image("fondo", "img/space.png");
    juego.load.image("personaje", "img/nave.png");
    juego.load.image("laser", "img/laser.png");
    juego.load.image("laserEnemigo", "img/laser_enemigo.png");
    juego.load.image("enemigo", "img/pajaro2.png");
    juego.load.image("enemigoNivel2", "img/enemigo2.png");
    juego.load.audio("musicaFondo", "audio/fondo.mp3");
    juego.load.audio("sonidoDisparoJugador", "audio/disparo_jugador.mp3");
    juego.load.audio("sonidoDisparoEnemigo", "audio/disparo_enemigo.mp3");
    juego.load.audio("sonidoExplosion", "audio/explosion.mp3");
    juego.load.audio("sonidoColision", "audio/colision.mp3");
  },
  create: function () {
    fondoJuego = juego.add.tileSprite(0, 0, 370, 550, "fondo");
    nave = juego.add.sprite(juego.width / 2, 500, "personaje");
    nave.anchor.setTo(0.5);

    juego.physics.enable(nave, Phaser.Physics.ARCADE);
    nave.body.collideWorldBounds = true;

    cursores = juego.input.keyboard.createCursorKeys();
    botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.crearBalas();
    this.crearBalasEnemigos();
    this.crearEnemigos();

    scoreText = juego.add.text(10, 10, "Puntos: 0", {
      font: "16px Arial",
      fill: "#ffffff",
    });
    vidasText = juego.add.text(10, 30, "Vidas: 3", {
      font: "16px Arial",
      fill: "#ffffff",
    });
    nivelText = juego.add.text(juego.world.width - 70, 10, "Nivel: 1", {
      font: "16px Arial",
      fill: "#ffffff",
    });

    musicaFondo = juego.add.audio("musicaFondo");
    sonidoDisparoJugador = juego.add.audio("sonidoDisparoJugador");
    sonidoDisparoEnemigo = juego.add.audio("sonidoDisparoEnemigo");
    sonidoExplosion = juego.add.audio("sonidoExplosion");
    sonidoColision = juego.add.audio("sonidoColision");

    musicaFondo.loop = true;
    musicaFondo.play();
  },
  update: function () {
    fondoJuego.tilePosition.y += 2;

    if (cursores.right.isDown && nave.x < juego.width - nave.width / 2) {
      nave.body.velocity.x = 200;
    } else if (cursores.left.isDown && nave.x > nave.width / 2) {
      nave.body.velocity.x = -200;
    } else {
      nave.body.velocity.x = 0;
    }

    if (botonDisparo.isDown) {
      this.disparar();
    }

    this.disparoEnemigo();

    juego.physics.arcade.overlap(
      balas,
      enemigos,
      this.colisionBalaEnemigo,
      null,
      this
    );
    juego.physics.arcade.overlap(
      balasEnemigos,
      nave,
      this.colisionBalaJugador,
      null,
      this
    );
    juego.physics.arcade.overlap(
      nave,
      enemigos,
      this.colisionNaveEnemigo,
      null,
      this
    );

    if (enemigos.countLiving() === 0) {
      this.pasarNivel();
    }
  },
  crearBalas: function () {
    balas = juego.add.group();
    balas.enableBody = true;
    balas.physicsBodyType = Phaser.Physics.ARCADE;
    balas.createMultiple(20, "laser");
    balas.setAll("anchor.x", 0.5);
    balas.setAll("anchor.y", 1);
    balas.setAll("outOfBoundsKill", true);
    balas.setAll("checkWorldBounds", true);
  },
  crearBalasEnemigos: function () {
    balasEnemigos = juego.add.group();
    balasEnemigos.enableBody = true;
    balasEnemigos.physicsBodyType = Phaser.Physics.ARCADE;
    balasEnemigos.createMultiple(30, "laserEnemigo");
    balasEnemigos.setAll("anchor.x", 0.5);
    balasEnemigos.setAll("anchor.y", 1);
    balasEnemigos.setAll("outOfBoundsKill", true);
    balasEnemigos.setAll("checkWorldBounds", true);
  },
  crearEnemigos: function () {
    enemigos = juego.add.group();
    enemigos.enableBody = true;
    enemigos.physicsBodyType = Phaser.Physics.ARCADE;

    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 10; x++) {
        var enemigo = enemigos.create(
          x * 36,
          y * 30,
          nivel === 1 ? "enemigo" : "enemigoNivel2"
        );
        enemigo.anchor.setTo(0.5);
      }
    }
    enemigos.x = 5;
    enemigos.y = 30;

    var velocidad = nivel === 1 ? 1000 : 500;
    var animacion = juego.add
      .tween(enemigos)
      .to({ x: 200 }, velocidad, Phaser.Easing.Linear.None, true, 0, -1, true);
  },
  disparar: function () {
    if (juego.time.now > tiempoBala) {
      var bala = balas.getFirstExists(false);
      if (bala) {
        bala.reset(nave.x, nave.y);
        bala.body.velocity.y = -300;
        tiempoBala = juego.time.now + 100;
        sonidoDisparoJugador.play();
      }
    }
  },
  disparoEnemigo: function () {
    if (juego.time.now > tiempoDisparoEnemigo) {
      var balaEnemiga = balasEnemigos.getFirstExists(false);
      if (balaEnemiga) {
        var enemigoVivo = enemigos.getFirstAlive();
        if (enemigoVivo) {
          balaEnemiga.reset(enemigoVivo.x, enemigoVivo.y);
          balaEnemiga.body.velocity.y = 150;
          tiempoDisparoEnemigo = juego.time.now + (nivel === 1 ? 2000 : 1000);
          sonidoDisparoEnemigo.play();
        }
      }
    }
  },
  colisionBalaEnemigo: function (bala, enemigo) {
    bala.kill();
    enemigo.kill();
    sonidoExplosion.play();
    score += 1;
    scoreText.text = "Puntos: " + score;
  },
  colisionBalaJugador: function (nave, bala) {
    bala.kill();
    sonidoColision.play();
    vidas -= 1;
    vidasText.text = "Vidas: " + vidas;
    if (vidas <= 0) {
      this.finJuego(false);
    }
  },
  colisionNaveEnemigo: function (nave, enemigo) {
    enemigo.kill();
    sonidoColision.play();
    vidas -= 1;
    vidasText.text = "Vidas: " + vidas;
    if (vidas <= 0) {
      this.finJuego(false);
    }
  },
  pasarNivel: function () {
    if (nivel === 1) {
      nivel = 2;
      nivelText.text = "Nivel: " + nivel;
      this.crearEnemigos();
    } else {
      this.finJuego(true);
    }
  },
  finJuego: function (victoria) {
    nave.kill();
    enemigos.callAll("kill");
    balasEnemigos.callAll("kill");
    var mensaje = victoria ? "¡GANASTE!" : "VUELVE A INTENTARLO";
    mensajeFinal = juego.add.text(
      juego.world.centerX,
      juego.world.centerY,
      mensaje,
      { font: "32px Arial", fill: "#ffffff" }
    );
    mensajeFinal.anchor.setTo(0.5);

    juego.time.events.add(
      Phaser.Timer.SECOND * 3,
      function () {
        juego.state.start("inicio");
      },
      this
    );
  },
};

juego.state.add("inicio", estadoInicio);
juego.state.add("principal", estadoPrincipal);
juego.state.start("inicio");
