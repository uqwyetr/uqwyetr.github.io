var bg,
    player,
    enemies,
    bullets,
    lasers,
    hearts,
    medic,
    sideguns,
    score,
    gunTimer,
    phase,
    txtScore,
    txtGunTimer,
    txtPhase,
    txtPaused;


//
// Enemy laser firing and movement function
//

var enemyAi = function (enemy) {
    //Properties
    enemy.tweenInterval = 4000; //Side to side
    enemy.body.velocity.y = 10; //
    enemy.movementWidth = 50;
    enemy.laserInterval = 2000;
    enemy.laserSpeed = 100;

    //Shoots lasers
    var laserloop = game.time.events.loop(enemy.laserInterval, function () {
        var laser = lasers.create(enemy.centerX, enemy.y + enemy.height, 'laser');
        laser.body.velocity.y = enemy.laserSpeed;
        laser.anchor.set(0.5);
        laser.update = function () {
            if (laser.y > game.world.height) {
                laser.destroy();
            }
        }
    }, this);

    //Gets called when enemy is dead
    enemy.stopBullets = function () {
        game.time.events.remove(laserloop);
    }
    //Enemy swinging motion
    game.add.tween(enemy).to({ x: enemy.x + enemy.movementWidth }, enemy.tweenInterval / 2, Phaser.Easing.Sinusoidal.InOut)
        .to({ x: enemy.x }, enemy.tweenInterval / 2, Phaser.Easing.Sinusoidal.InOut)
        .loop()
        .start();

    //Kills the enemy if it reaches bottom of the world
    enemy.update = function () {
        if (enemy.y > game.world.height) {
            enemy.destroy();
        }
    }
}
//
// Collision handlers
//
var spawnMedic = function (x, y) {
    var bag = medic.create(x, y, 'medic');
    bag.body.velocity.y = 20;
    bag.update = function () {
        if (bag.y > game.world.height) {
            bag.kill();
        }
    }
}
var spawnSideguns = function (x, y) {
    var gun = sideguns.create(x, y, 'sideguns');
    gun.body.velocity.y = 20;
    gun.update = function () {
        if (gun.y > game.world.height) {
            gun.kill();
        }
    }
}

var heal = function (player, medic) {
    player.health++;
    hearts.create(hearts.getTop().x + 30, 20, 'heart');
    medic.kill();
}
var getGuns = function (player, gun) {
    player.sideGuns = true;
    gun.kill();
    gunTimer += 10;
}
var enemyVsBullet = function (enemy, bullet) {
    if (game.rnd.integerInRange(1, 70) === 1) {
        spawnMedic(enemy.x, enemy.y);
    }
    if (game.rnd.integerInRange(1, 30) === 1) {
        spawnSideguns(enemy.x, enemy.y);
    }
    enemy.stopBullets();
    enemy.kill();
    bullet.kill();
    addScore(100);

}
var playerVsLaser = function (player, laser) {
    if (!player.invincible) {
        player.health--;
        hearts.getTop().destroy();
        laser.kill();
        if (player.health < 1) {
            player.kill();
            game.state.start('GameOver');
        }
        player.invincible = true;
        player.alpha = 0.5;
        game.time.events.add(300, function () {
            player.invincible = false;
            player.alpha = 1;
        })
    }

}

var addScore = function (amount) {
    score += amount;
    txtScore.text = 'Score : ' + score.toString();
}




///////////////////////////////////////////////////////////////////////////////
////////////////////////////////Game States////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var Boot = {
    preload: function () {
        game.load.image('bg', 'assets/bg.jpg');
        game.load.image('startButton', 'assets/startButton.png');
        game.load.image('restartButton', 'assets/restartButton.png');
        game.load.image('player', 'assets/player.png');
        game.load.image('enemy', 'assets/enemy.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('laser', 'assets/laser.png');
        game.load.image('heart', 'assets/heart.png');
        game.load.image('medic', 'assets/medic.png');
        game.load.image('sideguns', 'assets/sideguns.png');
    },
    create: function () {
        bg = game.add.image(0, 0, 'bg');
        bg.width = game.world.width;
        bg.height = game.world.height;
        game.add.text(game.world.centerX, game.world.centerY - 100, 'A Very Good Space Shooter', {
            font: '40px Arial ',
            fill: '#fff'
        })
            .setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2)
            .anchor.set(0.5);
        game.add.button(game.world.centerX, game.world.centerY + 40, 'startButton', this.loadMain)
            .anchor.set(0.5, 0.5);
        game.add.text(game.world.centerX, game.world.centerY + 160, ' Press left mouse button to fire\nPress space to pause the game ', {
            font: '17px Arial ',
            fill: '#fff',
        })
            .setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2)
            .anchor.set(0.5);
    },
    loadMain: function () {
        game.state.start('Main');
        game.input.mouse.requestPointerLock();
    },
    shutdown: function () {
        game.world.remove(bg);
    }
}



var Main = {
    create: function () {
        //Adding player and setting its propersies
        //Adding background

        this.add.existing(bg);

        player = game.add.sprite(game.world.centerX, game.world.height - 100, 'player');
        player.anchor.set(0.5);
        player.health = 5;
        player.invincible = false;
        player.sideGuns = false;
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.collideWorldBounds = true;
        score = 0;
        gunTimer = 0;


        //Adding physics enabled groups


        bullets = game.add.physicsGroup(Phaser.Physics.ARCADE);
        enemies = game.add.physicsGroup(Phaser.Physics.ARCADE);
        lasers = game.add.physicsGroup(Phaser.Physics.ARCADE);
        medic = game.add.physicsGroup(Phaser.Physics.ARCADE);
        sideguns = game.add.physicsGroup(Phaser.Physics.ARCADE);


        // UI elements

        hearts = game.add.group();
        for (var i = 0; i < player.health; i++) {
            hearts.create(20 + i * 30, 20, 'heart');
        }


        txtScore = game.add.text(game.world.width - 30, 20, 'Score : ' + score.toString(), {
            font: '20px Arial ',
            fill: '#fff'
        })
            .setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);
        txtScore.anchor.set(1, 0)


        txtGunTimer = game.add.text(game.world.centerX, 20, '', {
            font: '20px Arial ',
            fill: '#fff'
        })
            .setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);
        txtGunTimer.anchor.set(0.5, 0)

        //Space key for pausing

        game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
            .onDown.add(function () {
                game.paused = !game.paused;
            })

        //Mouse movement controls
        game.input.mouse.mouseDownCallback = function () {
            game.input.mouse.requestPointerLock();
        }
        game.input.addMoveCallback(function (pointer, x, y, click) {
            if (game.input.mouse.locked && !click) {
                player.x += game.input.mouse.event.movementX;
                player.y += game.input.mouse.event.movementY;
            }
        }, this);


        //Player bullet fire
        game.time.events.loop(Phaser.Timer.SECOND / 3, function () {
            if (game.input.activePointer.leftButton.isDown) {
                var bullet = bullets.create(player.centerX, player.y, 'bullet');
                bullet.anchor.set(0.5);
                bullet.body.velocity.y = -300;
                bullet.update = function () {
                    if (this.y < 0) {
                        bullet.destroy();
                    }
                }
                if (player.sideGuns) {
                    var sidebullet1 = bullets.create(player.centerX, player.y, 'bullet');
                    sidebullet1.anchor.set(0.5);
                    sidebullet1.angle = 45;
                    sidebullet1.body.velocity.y = -300 * Math.sin(Math.PI / 4);
                    sidebullet1.body.velocity.x = 300 * Math.sin(Math.PI / 4);
                    sidebullet1.update = function () {
                        if (this.y < 0) {
                            sidebullet1.destroy();
                        }
                    }
                    var sidebullet2 = bullets.create(player.centerX, player.y, 'bullet');
                    sidebullet2.anchor.set(0.5);
                    sidebullet2.angle = -45;
                    sidebullet2.body.velocity.y = -300 * Math.sin(Math.PI / 4);
                    sidebullet2.body.velocity.x = -300 * Math.sin(Math.PI / 4);

                    sidebullet2.update = function () {
                        if (this.y < 0) {
                            sidebullet2.destroy();
                        }
                    }
                }
            }
        }, this);

        // Tick down gun timer
        game.time.events.loop(1000, function () {
            if (gunTimer > 0) {
                gunTimer--;
            } else {
                player.sideGuns = false;
            }
        }, this);

        // Regularly create enemies

        phase = 0; //Dont touch

        var interval = 20000; //How fast the difficulty changes
        var initialTimer = 3000; // How fast enemeis come in the first section of the game
        var targetTimer = 50; // Limit at infinite
        var coefficient = 0.2; // How gradual the changes are. Lower the value, slower the changes


        var enemyEventHandler = game.time.events.loop(initialTimer, function () {
            var enemy = enemies.create(game.rnd.integerInRange(50, game.world.width - 50), -30, 'enemy');
            enemyAi(enemy);
        }, this);
        txtPhase = game.add.text(20, game.world.height - 20, 'Phase ' + (phase + 1).toString(), {
            font: '20px Arial',
            fill: '#fff'
        });
        txtPhase.anchor.set(0, 1);

        game.time.events.loop(interval, function () {

            //Math time!
            enemyEventHandler.delay = ((coefficient * targetTimer * phase + initialTimer) / ((coefficient * phase + 1)));
            phase++;
            txtPhase.text = 'Phase ' + (phase + 1).toString();

        }, this);

        txtPaused = game.add.text(game.world.centerX, game.world.centerY, '', {
            font: '40px Arial',
            fill: '#fff'
        });
        txtPaused.anchor.set(0.5);
        game.onPause.dispatch = function () {
            txtPaused.text = 'Paused';
            game.input.mouse.releasePointerLock();
        }
        game.onResume.dispatch = function () {
            txtPaused.text = '';
        }


    },
    update: function () {
        game.physics.arcade.overlap(enemies, bullets, enemyVsBullet);
        game.physics.arcade.overlap(player, lasers, playerVsLaser);
        game.physics.arcade.overlap(player, medic, heal);
        game.physics.arcade.overlap(player, sideguns, getGuns);
        if (gunTimer > 0) {
            txtGunTimer.text = gunTimer;
        } else {
            txtGunTimer.text = '';
        }
    },
    shutdown: function () {
        game.world.remove(bg);
    }
}
var GameOver = {
    create: function () {
        this.add.existing(bg);
        game.input.mouse.releasePointerLock();
        game.add.text(game.world.centerX, game.world.centerY - 120, 'Game Over', {
            font: '40px Arial',
            fill: '#fff'
        }).anchor.set(0.5);
        game.add.text(game.world.centerX, game.world.centerY - 20, 'Your score is ' + score, {
            font: '20px Arial',
            fill: '#fff'
        }).anchor.set(0.5);
        game.add.button(game.world.centerX, game.world.centerY + 100, 'restartButton', this.restart)
            .anchor.set(0.5);

    },
    restart: function () {
        game.state.start('Main');
    },
    shutdown: function () {
        game.world.remove(bg);
    }
}
var game = new Phaser.Game(1000, 800, Phaser.AUTO, 'game');
game.state.add('Boot', Boot);
game.state.add('Main', Main);
game.state.add('GameOver', GameOver);
game.state.start('Boot');
