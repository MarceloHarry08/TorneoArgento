/* TORNEO ARGENTO 16-BIT - CHARACTER DEFINITIONS & MOVESETS (MORTAL KOMBAT STYLE) */

const CHARACTERS = {
    leon: {
        id: 'leon',
        name: 'LEON',
        alias: 'Javier Milei',
        quote: '¡Viva la libertad carajo!',
        stats: { atk: 88, spd: 85, spc: 92 },
        moves: {
            special1: { id: 'bite', name: 'Mordisco Salvaje', cmd: '↓ → + J', type: 'melee_special', dmg: 16, cost: 15, desc: 'Un león astral se abalanza y propina una feroz mordida.' },
            special2: { id: 'claw_punch', name: 'Puño de León / Zarpazo', cmd: '↓ ← + K', type: 'strike_special', dmg: 18, cost: 20, desc: 'Zarpazo felino con garras doradas y puñetazo luminoso.' },
            special3: { id: 'roar', name: 'Rugido de la Selva', cmd: '↓ → + L', type: 'projectile', projType: 'lion_roar', dmg: 20, cost: 25, desc: 'Emite un rugido colosal con ondas sonoras doradas expansivas.' },
            super: { id: 'leon_super', name: 'León Astral Supremo', cmd: '↓ → ↓ → + I', type: 'super', dmg: 45, cost: 100, desc: 'Invoca un león celestial gigante que desgarra la pantalla.' },
            fatality: { name: 'Privatización Total', cmd: '↓ ↓ + L', desc: '¡Desintegra al rival con el rugido y garras de león definitivas!' }
        },
        combos: [
            { name: 'Combo León', input: 'J, J, K', hits: 3, dmg: 16 },
            { name: 'Garras Furiosas', input: 'K, ↓ ← + K', hits: 4, dmg: 26 },
            { name: 'Rugido Mortal', input: 'J, K, ↓ → + L', hits: 5, dmg: 32 }
        ]
    },

    latina: {
        id: 'latina',
        name: 'LATINA',
        alias: 'Cristina Kirchner',
        quote: '¡No nos fue tan mal!',
        stats: { atk: 78, spd: 72, spc: 96 },
        moves: {
            special1: { id: 'solar_ray', name: 'Rayo de Sol de Mayo', cmd: '↓ → + J', type: 'vertical_beam', dmg: 18, cost: 20, desc: 'Un rayo solar dorado desciende directamente del cielo calcinando al rival.' },
            special2: { id: 'pyramid_barrage', name: 'Lluvia de Pirámides', cmd: '↓ ← + K', type: 'projectile', projType: 'pyramids', dmg: 16, cost: 20, desc: 'Dispara pequeñas pirámides místicas de cristal en abanico.' },
            special3: { id: 'cadena_blast', name: 'Cadena Nacional Blast', cmd: '↓ → + L', type: 'projectile', projType: 'cadena', dmg: 20, cost: 25, desc: 'Onda expansiva de energía dorada con el símbolo nacional.' },
            super: { id: 'pyramid_prison', name: 'Poder Piramidal Cósmico', cmd: '↓ → ↓ → + I', type: 'super', dmg: 44, cost: 100, desc: 'Encierra al enemigo en una pirámide de energía solar electrocutante.' },
            fatality: { name: 'Cadena 24 Horas', cmd: '↓ ↓ + L', desc: '¡Atrapa al enemigo en un discurso infinito de 16-bits!' }
        },
        combos: [
            { name: 'Ataque Popular', input: 'J, K, J', hits: 3, dmg: 15 },
            { name: 'Lluvia Solar', input: 'K, ↓ → + J', hits: 4, dmg: 25 },
            { name: 'Combo Pirámide', input: 'J, J, ↓ ← + K', hits: 5, dmg: 30 }
        ]
    },

    ojosazules: {
        id: 'ojosazules',
        name: 'OJOS AZULES',
        alias: 'Mauricio Macri',
        quote: '¡Pasaron cosas... y se puede!',
        stats: { atk: 72, spd: 82, spc: 88 },
        moves: {
            special1: { id: 'cat_throw', name: 'Lanzamiento Gatuno', cmd: '↓ → + J', type: 'projectile', projType: 'flying_cat', dmg: 16, cost: 15, desc: 'Lanza un gato siamés de píxeles que vuela y araña al oponente.' },
            special2: { id: 'kitten_stampede', name: 'Estampida de Gatitos', cmd: '↓ ← + K', type: 'ground_hazard', projType: 'kittens', dmg: 18, cost: 20, desc: 'Una hilera de pequeños gatitos corre por el piso haciendo tropezar al rival.' },
            special3: { id: 'yellow_balloon', name: 'Globo Amarillo Mine', cmd: '↓ → + L', type: 'projectile', projType: 'balloon', dmg: 19, cost: 25, desc: 'Mina aérea flotante que detona al contacto liberando confeti electrificado.' },
            super: { id: 'feline_presidential', name: 'Garra Felina Presidencial', cmd: '↓ → ↓ → + I', type: 'super', dmg: 42, cost: 100, desc: 'Zarpazo felino gigante con destellos celestes en los ojos.' },
            fatality: { name: 'Reposera Mortal', cmd: '↓ ↓ + L', desc: '¡Aplasta al contrincante con un Globo Amarillo Gigante!' }
        },
        combos: [
            { name: 'Combo Reposera', input: 'J, J, K', hits: 3, dmg: 14 },
            { name: 'Ataque Gatuno', input: 'K, ↓ → + J', hits: 4, dmg: 24 },
            { name: 'Estampida Express', input: 'J, K, ↓ ← + K', hits: 5, dmg: 29 }
        ]
    },

    pepeargento: {
        id: 'pepeargento',
        name: 'PEPE ARGENTO',
        alias: 'El Patrón / Guillermo F.',
        quote: '¡Hermosa mañana, ¿verdad?!',
        stats: { atk: 86, spd: 80, spc: 84 },
        moves: {
            special1: { id: 'racing_fury', name: 'Furia Racing Club', cmd: '↓ → + J', type: 'rapid_punches', dmg: 18, cost: 20, desc: 'Se enfurece al extremo con cara roja y lanza una ráfaga devastadora de piñas.' },
            special2: { id: 'shoe_kick', name: 'Zapatazo Rabioso', cmd: '↓ ← + K', type: 'dash_kick', dmg: 20, cost: 20, desc: 'Patada voladora acrobática de zapatero envuelta en llamas.' },
            special3: { id: 'contraband_call', name: 'Contraband Call', cmd: '↓ → + L', type: 'projectile', projType: 'pistol_shot', dmg: 20, cost: 25, desc: 'Saca una pistola retro de píxeles y dispara un proyectil certero.' },
            super: { id: 'soquete_strike', name: '¡Pedazo de Soooquete!', cmd: '↓ → ↓ → + I', type: 'super', dmg: 46, cost: 100, desc: 'Desata una tormenta de insultos cómicos, piñas y patadas demoliendo al rival.' },
            fatality: { name: 'Portazo y Carcajada', cmd: '↓ ↓ + L', desc: '¡Lanza su carcajada legendaria pulverizando la pantalla!' }
        },
        combos: [
            { name: 'Zapatazo Coqui', input: 'J, K, K', hits: 3, dmg: 16 },
            { name: 'Furia de Flores', input: 'J, J, ↓ → + J', hits: 5, dmg: 28 },
            { name: 'Combo Racing', input: 'K, ↓ ← + K', hits: 4, dmg: 27 }
        ]
    },

    eleternauta: {
        id: 'eleternauta',
        name: 'EL ETERNAUTA',
        alias: 'Ricardo Darín / Block Boss',
        quote: '¡Nevada fosforescente en Buenos Aires!',
        stats: { atk: 88, spd: 78, spc: 94 },
        moves: {
            special1: { id: 'freeze_blast', name: 'Nevada Mortal (Congelación Sub-Zero)', cmd: '↓ → + J', type: 'freeze_projectile', projType: 'ice_blast', dmg: 16, cost: 25, desc: 'Ráfaga criogénica que CONGELA al rival en un témpano de hielo durante 2 segundos.' },
            special2: { id: 'ice_monolith', name: 'Monolito de Hielo', cmd: '↓ ← + K', type: 'summon_crush', projType: 'ice_sculpture', dmg: 22, cost: 25, desc: 'Invoca una escultura de bloques de hielo macizo que cae aplastando al enemigo.' },
            special3: { id: 'voxel_barrier', name: 'Voxel Barrier', cmd: '↓ → + L', type: 'defensive_wall', projType: 'voxel_wall', dmg: 15, cost: 20, desc: 'Levanta un muro defensivo de cubos de hielo que absorbe y repele proyectiles.' },
            super: { id: 'absolute_zero', name: 'Esferas de Cero Absoluto', cmd: '↓ → ↓ → + I', type: 'super', dmg: 48, cost: 100, desc: 'Genera orbes helados cortantes que congelan el suelo y estallan en fragmentos gélidos.' },
            fatality: { name: 'Criogenización Urbana', cmd: '↓ ↓ + L', desc: '¡Encierra al enemigo en una tumba de nieve letal fosforescente!' }
        },
        combos: [
            { name: 'Combo Criogénico', input: 'J, J, K', hits: 3, dmg: 17 },
            { name: 'Congelación Rápida', input: 'K, ↓ → + J', hits: 4, dmg: 26 },
            { name: 'Aplaste Gélido', input: 'J, K, ↓ ← + K', hits: 5, dmg: 32 }
        ]
    },

    elcomandante: {
        id: 'elcomandante',
        name: 'EL COMANDANTE',
        alias: 'Ricardo Fort',
        quote: '¡Basta chicos! ¡Miami me lo confirmó!',
        stats: { atk: 92, spd: 76, spc: 88 },
        moves: {
            special1: { id: 'money_storm', name: 'Tormenta de Billetes', cmd: '↓ → + J', type: 'projectile', projType: 'dollars', dmg: 18, cost: 20, desc: 'Dispara una ráfaga de billetes de 100 dólares afilados que vuelan girando.' },
            special2: { id: 'gold_suitcase', name: 'Lluvia de Dólares y Oro', cmd: '↓ ← + K', type: 'summon_drop', projType: 'suitcase', dmg: 22, cost: 25, desc: 'Una valija de lingotes de oro y fajos cae del cielo golpeando al rival.' },
            special3: { id: 'rolls_royce_dash', name: 'Rolls Royce Dash', cmd: '↓ → + L', type: 'dash_strike', dmg: 20, cost: 20, desc: 'Embestida de lujo a alta velocidad impulsada por un aura dorada.' },
            super: { id: 'basta_chicos', name: '¡Basta Chicos! Miami Explosion', cmd: '↓ → ↓ → + I', type: 'super', dmg: 48, cost: 100, desc: 'Detonación masiva de champán, fuegos artificiales y fajos de dólares.' },
            fatality: { name: 'Cutucucho Miami', cmd: '↓ ↓ + L', desc: '¡Atropella al rival con un Rolls Royce plateado lleno de dólares!' }
        },
        combos: [
            { name: 'Combo Chocolate', input: 'K, K, J', hits: 3, dmg: 18 },
            { name: 'Tormenta de Dólares', input: 'J, J, ↓ → + J', hits: 5, dmg: 28 },
            { name: 'Miami Rush', input: 'K, ↓ → + L', hits: 4, dmg: 30 }
        ]
    },

    elmesias: {
        id: 'elmesias',
        name: 'EL MESÍAS',
        alias: 'Lionel Messi',
        quote: '¡Qué mirás, bobo! ¡Andá pa allá!',
        stats: { atk: 92, spd: 96, spc: 96 },
        moves: {
            special1: { id: 'free_kick', name: 'Tiro Libre Chanfle 10', cmd: '↓ → + J', type: 'projectile', projType: 'curved_ball', dmg: 20, cost: 20, desc: 'Remate con comba de una pelota de fútbol de fuego celeste y blanco.' },
            special2: { id: 'cosmic_dribble', name: 'Gambeta Cósmica', cmd: '↓ ← + K', type: 'teleport_strike', dmg: 18, cost: 20, desc: 'Esquiva veloz dejando sombras y remata una pelota dorada al mentón.' },
            special3: { id: 'balon_oro', name: 'Balón de Oro Cannon', cmd: '↓ → + L', type: 'projectile', projType: 'gold_ball', dmg: 22, cost: 25, desc: 'Disparo de pelota de oro macizo a la velocidad de la luz.' },
            super: { id: 'bicycle_kick', name: 'Chilena del Campeón del Mundo', cmd: '↓ → ↓ → + I', type: 'super', dmg: 52, cost: 100, desc: 'Salto celestial de chilena que dispara un cometa dorado directo a la red.' },
            fatality: { name: 'Qué Mirás Bobo Laser', cmd: '↓ ↓ + L', desc: '¡Dispara un cañonazo dorado legendario que pulveriza al arquero rival!' }
        },
        combos: [
            { name: 'Gambeta Dorada', input: 'J, J, J, K', hits: 4, dmg: 22 },
            { name: 'Tiro con Chanfle', input: 'K, ↓ → + J', hits: 4, dmg: 28 },
            { name: 'Triplete 10', input: 'J, K, ↓ → + L', hits: 5, dmg: 34 }
        ]
    },

    moria: {
        id: 'moria',
        name: 'LA ONE',
        alias: 'Moria Casán',
        quote: '¡Si querés llorar, llorá!',
        stats: { atk: 84, spd: 80, spc: 90 },
        moves: {
            special1: { id: 'steel_claws', name: 'Uñas de Acero', cmd: '↓ → + J', type: 'melee_slash', dmg: 18, cost: 15, desc: 'Zarpazo con uñas acrílicas kilométricas rojas que cortan el aire.' },
            special2: { id: 'hair_whip', name: 'Látigo de Cabellera', cmd: '↓ ← + K', type: 'strike_special', dmg: 19, cost: 20, desc: 'Su cabellera azabache se extiende y azota como múltiples látigos.' },
            special3: { id: 'karate_tongue', name: 'Lengua Karateka', cmd: '↓ → + L', type: 'projectile', projType: 'words_blade', dmg: 20, cost: 25, desc: 'Estocada verbal con proyectil de palabras afiladas de alta velocidad.' },
            super: { id: 'diva_whirlwind', name: 'Torbellino Diva de Uñas y Pelo', cmd: '↓ → ↓ → + I', type: 'super', dmg: 45, cost: 100, desc: 'Gira en un huracán de pelo negro y estocadas de uñas cortantes.' },
            fatality: { name: 'Disintegración Llorá', cmd: '↓ ↓ + L', desc: '¡Beso holográfico y torbellino de uñas que desintegra al rival!' }
        },
        combos: [
            { name: 'Combo Karadagian', input: 'J, K, J', hits: 3, dmg: 16 },
            { name: 'Corte de Uñas', input: 'J, J, ↓ → + J', hits: 4, dmg: 26 },
            { name: 'Lengua y Cabello', input: 'K, ↓ ← + K', hits: 4, dmg: 28 }
        ]
    },

    lasu: {
        id: 'lasu',
        name: 'LA SU',
        alias: 'Susana Giménez',
        quote: '¡¿Vivo?! ¡Hola Susana!',
        stats: { atk: 80, spd: 78, spc: 88 },
        moves: {
            special1: { id: 'sun_storm', name: 'Tormenta de Sol Radiante', cmd: '↓ → + J', type: 'vertical_beam', dmg: 19, cost: 20, desc: 'Descarga calcinante con rayos del sol dorado estival de Punta del Este.' },
            special2: { id: 'golden_phone', name: 'Teléfono de Oro / ¡Hola Susana!', cmd: '↓ ← + K', type: 'projectile', projType: 'gold_phone', dmg: 18, cost: 20, desc: 'Lanza un teléfono retro dorado que emite timbrazos sónicos explosivos.' },
            special3: { id: 'winner_call', name: 'Llamado Millonario', cmd: '↓ → + L', type: 'projectile', projType: 'coupons', dmg: 18, cost: 20, desc: 'Lluvia de sobres y cupones ganadores con bordes afilados.' },
            super: { id: 'supernova_su', name: 'Supernova Punta del Este', cmd: '↓ → ↓ → + I', type: 'super', dmg: 44, cost: 100, desc: 'Invoca un sol colosal que ilumina y calcina toda la pantalla.' },
            fatality: { name: 'Cabina Telefónica 90s', cmd: '↓ ↓ + L', desc: '¡Encierra al enemigo en una cabina telefónica que estalla en monedas de oro!' }
        },
        combos: [
            { name: 'Combo Millonario', input: 'J, J, K', hits: 3, dmg: 15 },
            { name: 'Sol Ardiente', input: 'K, ↓ → + J', hits: 4, dmg: 25 },
            { name: 'Teléfono Rojo', input: 'J, K, ↓ ← + K', hits: 4, dmg: 27 }
        ]
    },

    hugo: {
        id: 'hugo',
        name: 'HUGO',
        alias: 'Marcelo Tinelli',
        quote: '¡Chau, chau, chauuu!',
        stats: { atk: 78, spd: 88, spc: 84 },
        moves: {
            special1: { id: 'sonic_laugh', name: 'Risa Sónica Ultrasónica', cmd: '↓ → + J', type: 'projectile', projType: 'laugh_waves', dmg: 16, cost: 15, desc: 'Carcajadas en ondas de sonido que aturden y frenan al enemigo.' },
            special2: { id: 'lightning_dance', name: 'Movimiento Relámpago', cmd: '↓ ← + K', type: 'dash_strike', dmg: 19, cost: 20, desc: 'Desplazamiento hiperrápido zigzagueante con sombras que confunden.' },
            special3: { id: 'rexona_missile', name: 'Rexona Missile', cmd: '↓ → + L', type: 'projectile', projType: 'deodorant', dmg: 18, cost: 20, desc: 'Aerosol presurizado que se dispara como cohete químico.' },
            super: { id: 'chau_blitz', name: '¡Chau Chau Chauuu! Blitz', cmd: '↓ → ↓ → + I', type: 'super', dmg: 43, cost: 100, desc: 'Ráfaga de golpes a velocidad supersónica que expulsa al rival del estudio.' },
            fatality: { name: 'Puntaje 10 Final', cmd: '↓ ↓ + L', desc: '¡Cae una paleta gigante del número 10 aplastando al enemigo!' }
        },
        combos: [
            { name: 'Bailando Rush', input: 'J, K, J', hits: 3, dmg: 14 },
            { name: 'Risa Mortal', input: 'J, J, ↓ → + J', hits: 4, dmg: 24 },
            { name: 'Combo Ritmo', input: 'K, ↓ ← + K', hits: 5, dmg: 29 }
        ]
    },

    pergolas: {
        id: 'pergolas',
        name: 'PERGOLAS',
        alias: 'Mario Pergolini',
        quote: '¡Caiga quien caiga!',
        stats: { atk: 82, spd: 86, spc: 86 },
        moves: {
            special1: { id: 'spy_drone', name: 'Dron Espía de Ataque', cmd: '↓ → + J', type: 'drone_summon', projType: 'drone', dmg: 18, cost: 20, desc: 'Invoca un dron volador pixelado que sobrevuela y dispara lásers.' },
            special2: { id: 'robot_sentry', name: 'Robot Centinela 16-Bit', cmd: '↓ ← + K', type: 'robot_summon', projType: 'robot', dmg: 20, cost: 25, desc: 'Un robot mecánico que camina disparando micromisiles.' },
            special3: { id: 'cqc_whip', name: 'CQC Mic Whip', cmd: '↓ → + L', type: 'melee_special', dmg: 18, cost: 20, desc: 'Látigo de cable de micrófono con descarga eléctrica.' },
            super: { id: 'orbital_hack', name: 'Hackeo Satelital CQC', cmd: '↓ → ↓ → + I', type: 'super', dmg: 46, cost: 100, desc: 'Disparo de cañón orbital espacial que hace temblar la pantalla.' },
            fatality: { name: 'Glitch de Televisión', cmd: '↓ ↓ + L', desc: '¡Atrapa al rival en un sintonizador de TV retro destruido!' }
        },
        combos: [
            { name: 'Combo Rebelde', input: 'J, J, K', hits: 3, dmg: 15 },
            { name: 'Ataque Dron', input: 'K, ↓ → + J', hits: 4, dmg: 25 },
            { name: 'Mic Flash', input: 'J, K, ↓ ← + K', hits: 5, dmg: 31 }
        ]
    },

    sangrejaponesa: {
        id: 'sangrejaponesa',
        name: 'SANGRE JAPONESA',
        alias: 'China Suárez / El Libertador',
        quote: '¡Beso letal y libertad!',
        stats: { atk: 86, spd: 84, spc: 90 },
        moves: {
            special1: { id: 'poison_kiss', name: 'Beso Venenoso', cmd: '↓ → + J', type: 'projectile', projType: 'poison_lips', dmg: 17, cost: 20, desc: 'Sopla labios de energía rosa tóxica con calaveras de veneno.' },
            special2: { id: 'toxic_mist', name: 'Niebla Tóxica', cmd: '↓ ← + K', type: 'ground_hazard', projType: 'poison_cloud', dmg: 18, cost: 20, desc: 'Nube violeta/verde en el suelo que daña continuamente al rival.' },
            special3: { id: 'saber_slash', name: 'Sablazo Granadero', cmd: '↓ → + L', type: 'strike_special', dmg: 20, cost: 20, desc: 'Estocada rápida de sable militar con chispas cortantes.' },
            super: { id: 'poison_thorns', name: 'Espinas del Amor Venenoso', cmd: '↓ → ↓ → + I', type: 'super', dmg: 45, cost: 100, desc: 'Ráfaga de rosas con espinas impregnadas en toxinas letales.' },
            fatality: { name: 'Carga de Caballería Tóxica', cmd: '↓ ↓ + L', desc: '¡Estampida de Granaderos con espadas de veneno púrpura!' }
        },
        combos: [
            { name: 'Combo Cordillera', input: 'J, K, K', hits: 3, dmg: 17 },
            { name: 'Beso Letal', input: 'J, J, ↓ → + J', hits: 4, dmg: 26 },
            { name: 'Sable y Veneno', input: 'K, ↓ ← + K', hits: 5, dmg: 30 }
        ]
    },

    lafaraona: {
        id: 'lafaraona',
        name: 'LA FARAONA',
        alias: 'Martín Cirio',
        quote: '¡Un beso faraónico, mi amor!',
        stats: { atk: 78, spd: 80, spc: 88 },
        moves: {
            special1: { id: 'corn_throw', name: 'Lanzamiento de Maíz Explosivo', cmd: '↓ → + J', type: 'projectile', projType: 'corn', dmg: 17, cost: 15, desc: 'Lanza choclos y granos de maíz que revientan como pochoclos ardientes.' },
            special2: { id: 'chicken_swarm', name: 'Invocación de Gallinas Cluecas', cmd: '↓ ← + K', type: 'ground_hazard', projType: 'chickens', dmg: 19, cost: 20, desc: 'Gallinas enfurecidas cacareando que corren picoteando al contrincante.' },
            special3: { id: 'faraonic_ray', name: 'Rayo Faraónico', cmd: '↓ → + L', type: 'projectile', projType: 'fuchsia_beam', dmg: 19, cost: 20, desc: 'Disparo de energía fucsia mística con símbolos jeroglíficos.' },
            super: { id: 'chicken_tornado', name: 'Estampida de Gallinas Faraónicas', cmd: '↓ → ↓ → + I', type: 'super', dmg: 44, cost: 100, desc: 'Tornado colosal de plumas y gallinas gigantes que barren el escenario.' },
            fatality: { name: 'Sarcófago de Oro y Maíz', cmd: '↓ ↓ + L', desc: '¡Sella al rival dentro de un sarcófago que se llena de pochoclos ardientes!' }
        },
        combos: [
            { name: 'Combo Chisme', input: 'J, J, K', hits: 3, dmg: 14 },
            { name: 'Maíz Caliente', input: 'K, ↓ → + J', hits: 4, dmg: 24 },
            { name: 'Ataque de Gallinas', input: 'J, K, ↓ ← + K', hits: 5, dmg: 30 }
        ]
    },

    badbitch: {
        id: 'badbitch',
        name: 'BAD BITCH',
        alias: 'Wanda Nara',
        quote: '¡Siempre consigue lo que quiere!',
        stats: { atk: 82, spd: 84, spc: 88 },
        moves: {
            special1: { id: 'glitter_bomb', name: 'Bomba de Glitter Explosivo', cmd: '↓ → + J', type: 'projectile', projType: 'glitter_bomb', dmg: 18, cost: 20, desc: 'Lanza un cosmético que estalla en una gran detonación de fuego y chispas.' },
            special2: { id: 'vip_landmine', name: 'Mina Antipersona VIP', cmd: '↓ ← + K', type: 'trap', projType: 'landmine', dmg: 20, cost: 20, desc: 'Coloca un explosivo en el piso que detona cuando el rival se acerca.' },
            special3: { id: 'louis_strike', name: 'Cartera Louis Strike', cmd: '↓ → + L', type: 'melee_special', dmg: 18, cost: 15, desc: 'Golpe contundente con bolso de diseño que aturde al rival.' },
            super: { id: 'paparazzi_c4', name: 'Detonación Masiva Paparazzi', cmd: '↓ → ↓ → + I', type: 'super', dmg: 46, cost: 100, desc: 'Explosión en cadena de flashes y pólvora que sacude violentamente la pantalla.' },
            fatality: { name: 'Enjambre Paparazzi C4', cmd: '↓ ↓ + L', desc: '¡Decenas de flashes enceguecedores y detonaciones hacen volar al enemigo!' }
        },
        combos: [
            { name: 'Combo Glamour', input: 'J, K, J', hits: 3, dmg: 15 },
            { name: 'Glitter Bang', input: 'J, J, ↓ → + J', hits: 4, dmg: 26 },
            { name: 'Carterazo VIP', input: 'K, ↓ → + L', hits: 4, dmg: 28 }
        ]
    },

    oidoabsoluto: {
        id: 'oidoabsoluto',
        name: 'OÍDO ABSOLUTO',
        alias: 'Charly García',
        quote: '¡Say No More! ¡Me tiré por vos!',
        stats: { atk: 88, spd: 86, spc: 94 },
        moves: {
            special1: { id: 'piano_drop', name: 'Acorde de Piano Gigante', cmd: '↓ → + J', type: 'summon_drop', projType: 'grand_piano', dmg: 22, cost: 25, desc: 'Deja caer un piano de cola con notas afiladas como sierras.' },
            special2: { id: 'guitar_riff', name: 'Riff de Guitarra Eléctrica', cmd: '↓ ← + K', type: 'projectile', projType: 'lightning_riff', dmg: 18, cost: 20, desc: 'Toca un acorde estridente que dispara relámpagos musicales rectos.' },
            special3: { id: 'synth_wave', name: 'Synth Shockwave', cmd: '↓ → + L', type: 'projectile', projType: 'synth_wave', dmg: 20, cost: 20, desc: 'Onda sonora de sintetizador polifónico expansiva.' },
            super: { id: 'say_no_more', name: 'Sinfonía Say No More', cmd: '↓ → ↓ → + I', type: 'super', dmg: 48, cost: 100, desc: 'Partituras en llamas y acordes colosales que demuelen el escenario.' },
            fatality: { name: 'Demoliendo Hoteles', cmd: '↓ ↓ + L', desc: '¡Cae una torre de amplificadores y un piano ejecutando un acorde perfecto!' }
        },
        combos: [
            { name: 'Combo Bicolor', input: 'J, J, K', hits: 3, dmg: 16 },
            { name: 'Riff Eléctrico', input: 'K, ↓ ← + K', hits: 4, dmg: 27 },
            { name: 'Piano Smash', input: 'J, K, ↓ → + J', hits: 5, dmg: 33 }
        ]
    },

    inmortal: {
        id: 'inmortal',
        name: 'INMORTAL',
        alias: 'Mirtha Legrand (JEFA FINAL)',
        quote: '¡Como te ven te tratan, y si te ven mal te maltratan!',
        stats: { atk: 98, spd: 90, spc: 100 }, // JEFA FINAL OVERPOWERED
        moves: {
            special1: { id: 'telekinetic_tableware', name: 'Levitación de Vajilla y Sillas', cmd: '↓ → + J', type: 'telekinetic_throw', projType: 'silver_cutlery', dmg: 24, cost: 15, desc: 'Levita en el aire arrojando sillas de oro y copas de cristal telequinéticas.' },
            special2: { id: 'immortal_lightning', name: 'Rayos de la Inmortalidad', cmd: '↓ ← + K', type: 'projectile', projType: 'divine_lightning', dmg: 26, cost: 20, desc: 'Dispara relámpagos divinos desde sus manos que rebotan en el mármol.' },
            special3: { id: 'mesaza_hammer', name: 'Mesaza Table Smash', cmd: '↓ → + L', type: 'strike_special', dmg: 25, cost: 20, desc: 'Impacto sísmico con el martillo dorado del mediodía.' },
            super: { id: 'eternal_judgment', name: 'Juicio Milenario de la Mesaza', cmd: '↓ → ↓ → + I', type: 'super', dmg: 58, cost: 100, desc: 'Levitación suprema: una mesa imperial gigante cae del cielo en una tormenta de rayos.' },
            fatality: { name: 'La Mesaza Final y Eterna', cmd: '↓ ↓ + L', desc: '¡Sienta al rival a la mesaza histórica para servirle el banquete definitivo!' }
        },
        combos: [
            { name: 'Combo Leyenda', input: 'J, K, K, K', hits: 4, dmg: 28 },
            { name: 'Levitación y Rayos', input: 'K, ↓ → + J', hits: 5, dmg: 35 },
            { name: 'Martillazo Almuerzo', input: 'J, J, ↓ → + L', hits: 5, dmg: 38 }
        ]
    }
};

// Aliases for compatibility
CHARACTERS.blockboss = CHARACTERS.eleternauta;

const ROSTER_KEYS = [
    'leon', 'latina', 'ojosazules', 'pepeargento', 'eleternauta', 'elcomandante',
    'elmesias', 'moria', 'lasu', 'hugo', 'pergolas',
    'sangrejaponesa', 'lafaraona', 'badbitch', 'oidoabsoluto', 'inmortal'
];

window.CHARACTERS = CHARACTERS;
window.ROSTER_KEYS = ROSTER_KEYS;
