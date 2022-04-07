function novoElemento(tagname, className) {
    const elem = document.createElement(tagname)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`

}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const velocidadeBarreira = 5
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - velocidadeBarreira)
            // console.log(`log getLargura ${par.getLargura}`)
            // console.log(`log getX ${par.getX}`)

            // quando o cano sair da area do jogo

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + velocidadeBarreira >= meio
                && par.getX() < meio
            if (cruzouMeio) notificarPonto()
        });
    }
}


function BotaoReiniciar(areaDoJogo) {
    this.elemento = novoElemento('img', 'reiniciar')
    this.elemento.src = './imgs/reiniciar.png'
    this.elemento.onclick = function () {
        while (areaDoJogo.firstChild) {
            areaDoJogo.firstChild.remove()
        }
        new YasuoBird().start()
    }

}

function Reiniciar(areaDoJogo, botao) {
    areaDoJogo.replaceChildren('')
    new YasuoBird().start()
}


function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -6)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        }
        else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        }
        else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

// const barreiras = new Barreiras(800,1200,300,400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// // const b = new ParDeBarreiras(700,500,800)
// // document.querySelector('[wm-flappy]').appendChild(b.elemento)

// areaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

// setInterval(() => 
// {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
        if (pontos > 0) {
            const audio = new Audio('./sounds/score.wav')
            audio.play()


        }
    }

    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const ladodireitoA = a.left + a.width
    const ladodireitoB = b.left + b.width

    const horizontal = ladodireitoA >= b.left && ladodireitoB >= a.left

    const verticalA = a.top + a.height
    const verticalB = b.top + b.height

    const vertical = verticalA >= b.top && verticalB >= a.top

    return horizontal && vertical

}

function colidiu(yasuo, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            colidiu = estaoSobrepostos(yasuo.elemento, superior) || estaoSobrepostos(yasuo.elemento, inferior)

        }

    })
    return colidiu
}

function YasuoBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const progresso = new Progresso()
    const reiniciar = new BotaoReiniciar(areaDoJogo)
    const barreiras = new Barreiras(800, 1200, 400, 400, () => progresso.atualizarPontos(pontos++))
    const yasuo = new Passaro(altura)
    //const tocandomusica = new MusicaDeFundo().getPlaying()
    

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(yasuo.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {

            barreiras.animar()
            yasuo.animar()
            // console.log(musica.pause = true)
            
            if (colidiu(yasuo, barreiras)) {
                clearInterval(temporizador)
                areaDoJogo.appendChild(reiniciar.elemento)

            }
        }, 20
        )
    }
}

function MusicaDeFundo() {

    this.musica = new Audio('./sounds/back.mp3')
    this.musica.loop = true
    //this.musica.muted = true
    this.getPlaying = () => this.musica.paused
    this.tocar = () => this.musica.play()

        
}

let inicio = 0
document.addEventListener('keydown', function(event) {
    const musica = new MusicaDeFundo()
    if (event.keyCode == 32 &&  inicio == 0){
        musica.tocar()
        inicio=1
    }
})
new YasuoBird().start()
   