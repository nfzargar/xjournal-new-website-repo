<template>
  <section id='issue3--poem' class='w-100'></section>
</template>

<style>
#issue3--poem {
  width: 100%;
  position: relative;
}

#issue3--poem > div > button {
  border: none;
  border-bottom: 1px dotted #ff3b30;
  background: none;
  cursor: pointer;
}

#issue3--poem > div > button:hover {
  background: rgba(255, 59, 48, 0.12);
}
</style>

<script>
import { imageUrl } from '@/images'
export default{
  mounted () {
    var synth = window.speechSynthesis
    // DATA ENTRY HELPERS
    let btnData = (str, x, y, w, h) => {
      return {
        'string': str,
        'position': {
          'x': '' + x + '%',
          'y': '' + y + '%'
        },
        'size': {
          'w': '' + w + '%',
          'h': '' + h + '%'
        }
      }
    }

    let pxDataToRelativeData = (x, y, w, h, imgW, imgH) => {
      return [
        (x / imgW) * 100,
        (y / imgH) * 100,
        (w / imgW) * 100,
        (h / imgH) * 100
      ]
    }

    // DOM CODE

    function addImg (url, parent) {
      let img = document.createElement('img')
      img.setAttribute('src', imageUrl(url, 1200))
      img.style.maxWidth = '100%'
      img.style.position = 'relative'
      parent.appendChild(img)
      return img
    }

    function addBtns (pbtnData, parent) {
      pbtnData.forEach((btnData) => {
        let newBtnElement = document.createElement('button')
        newBtnElement.style.width = btnData.size.w
        newBtnElement.style.height = btnData.size.h
        newBtnElement.style.position = 'absolute'
        newBtnElement.style.left = btnData.position.x
        newBtnElement.style.top = btnData.position.y
        newBtnElement.addEventListener('click', () => talkToMe(btnData.string))
        parent.appendChild(newBtnElement)
      })
    }

    function talkToMe (str) {
      // let utterance = new SpeechSynthesisUtterance(str);
      // utterance.pitch = 1.8;
      // utterance.rate = 0.8;
      synth.speak(spokenWord[str])
    }

    function wordToUtteranceDict (pages) {
      let allBtns = pages.flatMap((page) => page.buttons)
      let dict = {}
      allBtns.forEach((btnData) => {
        let utterance = new SpeechSynthesisUtterance(btnData.string)
        utterance.pitch = 1.8
        utterance.rate = 0.6
        dict[btnData.string] = utterance
      })
      return dict
    }

    // DATA ENTRY

    let pages = [
      {
        'image': 'lilyp1.jpg',
        'buttons': [
          btnData('a bit farther', ...pxDataToRelativeData(60, 543 - 10, 64, 20, 550, 800)),
          btnData('rustling', ...pxDataToRelativeData(253, 618 - 10, 68, 20, 550, 800)),
          btnData('on and on', ...pxDataToRelativeData(401, 564 - 10, 30, 20, 550, 800)),
          btnData('each day', ...pxDataToRelativeData(195, 524 - 10, 77, 20, 550, 800)),
          btnData('a bit farther', ...pxDataToRelativeData(385, 524 - 10, 46, 20, 550, 800)),
          btnData('voice', ...pxDataToRelativeData(263, 638 - 10, 42, 20, 550, 800)),
          btnData('deaf to', ...pxDataToRelativeData(339, 544 - 10, 69, 20, 550, 800)),
          btnData('a shrill', ...pxDataToRelativeData(160, 638 - 10, 60, 20, 550, 800)),
          btnData('on and on', ...pxDataToRelativeData(60, 580 - 10, 64, 20, 550, 800)),
          btnData('this', ...pxDataToRelativeData(303, 581 - 10, 36, 20, 550, 800))
        ]
      },
      {
        'image': 'lilyp2.jpg',
        'buttons': [
          btnData('so', ...pxDataToRelativeData(402, 740, 37, 47, 1200, 1800)),
          btnData('you almost seem', ...pxDataToRelativeData(239, 995, 262, 38, 1200, 1800)),
          btnData('dizzy', ...pxDataToRelativeData(813, 322, 99, 47, 1200, 1800)),
          btnData('just stopped there!', ...pxDataToRelativeData(198, 320, 307, 47, 1200, 1800)),
          btnData('it doesn\'t take much to hold us', ...pxDataToRelativeData(134, 779, 258, 47, 1200, 1800)),
          btnData('said', ...pxDataToRelativeData(553, 572, 72, 47, 1200, 1800)),
          btnData('you', ...pxDataToRelativeData(207, 946, 70, 47, 1200, 1800)),
          btnData('it doesn\'t take much to hold us', ...pxDataToRelativeData(699, 740, 230, 47, 1200, 1800)),
          btnData('said', ...pxDataToRelativeData(508, 947, 70, 47, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp3.jpg',
        'buttons': [
          btnData('building', ...pxDataToRelativeData(293, 708, 155, 47, 1200, 1800)),
          btnData('called the museum', ...pxDataToRelativeData(277, 756, 333, 42, 1200, 1800)),
          btnData('to', ...pxDataToRelativeData(281, 248, 47, 47, 1200, 1800)),
          btnData('in the', ...pxDataToRelativeData(825, 459, 104, 47, 1200, 1800)),
          btnData('to the edge', ...pxDataToRelativeData(576, 838, 199, 42, 1200, 1800)),
          btnData('live here', ...pxDataToRelativeData(782, 248, 147, 47, 1200, 1800)),
          btnData('we have seen', ...pxDataToRelativeData(477, 1172, 204, 42, 1200, 1800)),
          btnData('and', ...pxDataToRelativeData(296, 1214, 74, 42, 1200, 1800)),
          btnData('pictures', ...pxDataToRelativeData(490, 1005, 137, 42, 1200, 1800)),
          btnData('like', ...pxDataToRelativeData(371, 1005, 73, 42, 1200, 1800)),
          btnData('an hour', ...pxDataToRelativeData(701, 1339, 137, 42, 1200, 1800)),
          btnData('any picture', ...pxDataToRelativeData(583, 1089, 183, 42, 1200, 1800)),
          btnData('at his wrist watch', ...pxDataToRelativeData(888, 1381, 42, 42, 1200, 1800)),
          btnData('at his wrist watch', ...pxDataToRelativeData(131, 1423, 250, 42, 1200, 1800)),
          btnData('reflected in', ...pxDataToRelativeData(131, 1256, 181, 42, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp4.jpg',
        'buttons': [
          btnData('driving in', ...pxDataToRelativeData(161 - 12, 359, 164, 47, 1200, 1800)),
          btnData('the parking place', ...pxDataToRelativeData(366 - 12, 359, 285, 50, 1200, 1800)),
          btnData('as if', ...pxDataToRelativeData(709 - 12, 491, 96, 47, 1200, 1800)),
          btnData('interested in all the things we love in', ...pxDataToRelativeData(394 - 12, 872, 567, 42, 1200, 1800)),
          btnData('interested', ...pxDataToRelativeData(320 - 12, 1165, 160, 42, 1200, 1800)),
          btnData('it\'s a bus!', ...pxDataToRelativeData(269 - 12, 234, 168, 47, 1200, 1800)),
          btnData('a new animal', ...pxDataToRelativeData(933 - 12, 657, 32, 47, 1200, 1800)),
          btnData('in our nice camp', ...pxDataToRelativeData(666 - 12, 1001, 295, 42, 1200, 1800)),
          btnData('a new animal', ...pxDataToRelativeData(161 - 12, 698, 196, 47, 1200, 1800)),
          btnData('in', ...pxDataToRelativeData(900 - 12, 1127, 42, 42, 1200, 1800)),
          btnData('if anything happens', ...pxDataToRelativeData(310 - 12, 1416, 322, 42, 1200, 1800)),
          btnData('in', ...pxDataToRelativeData(752 - 12, 1252, 37, 42, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp5.jpg',
        'buttons': [
          btnData('a trapper', ...pxDataToRelativeData(785, 1217, 148, 43, 1200, 1800)),
          btnData('read something from a paper', ...pxDataToRelativeData(136, 866, 234, 43, 1200, 1800)),
          btnData('as we do now', ...pxDataToRelativeData(482, 1080, 243, 43, 1200, 1800)),
          btnData('see why they', ...pxDataToRelativeData(136, 568, 215, 43, 1200, 1800)),
          btnData('the people', ...pxDataToRelativeData(637, 362, 193, 43, 1200, 1800)),
          btnData('with', ...pxDataToRelativeData(669, 179, 105, 43, 1200, 1800)),
          btnData('for a long time before', ...pxDataToRelativeData(509, 1041, 360, 43, 1200, 1800)),
          btnData('the members of the party', ...pxDataToRelativeData(293, 909, 433, 43, 1200, 1800)),
          btnData('this before', ...pxDataToRelativeData(385, 278, 193, 43, 1200, 1800)),
          btnData('the mark on the stick', ...pxDataToRelativeData(321, 445, 377, 43, 1200, 1800)),
          btnData('look at the stick and say this', ...pxDataToRelativeData(377, 785, 525, 43, 1200, 1800)),
          btnData('seen', ...pxDataToRelativeData(869, 235, 91, 43, 1200, 1800)),
          btnData('and', ...pxDataToRelativeData(540, 831, 72, 43, 1200, 1800)),
          btnData('stop here', ...pxDataToRelativeData(136, 785, 156, 43, 1200, 1800)),
          btnData('the hard way', ...pxDataToRelativeData(599, 530, 224, 43, 1200, 1800)),
          btnData('which is beyond it', ...pxDataToRelativeData(552, 1341, 313, 43, 1200, 1800)),
          btnData('read something from a paper', ...pxDataToRelativeData(697, 831, 250, 43, 1200, 1800)),
          btnData('is the mountain', ...pxDataToRelativeData(222, 1292, 263, 43, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp6.jpg',
        'buttons': [
          btnData('hind legs and looked and looked', ...pxDataToRelativeData(608, 1159, 342, 43, 1200, 1800)),
          btnData('at the stems and', ...pxDataToRelativeData(587, 1037, 273, 43, 1200, 1800)),
          btnData('much alike', ...pxDataToRelativeData(354, 954, 196, 43, 1200, 1800)),
          btnData('and', ...pxDataToRelativeData(870, 1417, 79, 43, 1200, 1800)),
          btnData('hind legs and looked and looked', ...pxDataToRelativeData(134, 1202, 195, 43, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp7.jpg',
        'buttons': [
          btnData('the folder says', ...pxDataToRelativeData(449, 1297, 249, 43, 1200, 1800)),
          btnData('soil', ...pxDataToRelativeData(308, 793, 66, 43, 1200, 1800)),
          btnData('the name', ...pxDataToRelativeData(566, 1255, 162, 43, 1200, 1800)),
          btnData('up on the mountain', ...pxDataToRelativeData(741, 579, 202, 43, 1200, 1800)),
          btnData('up the deep depression', ...pxDataToRelativeData(566, 1172, 387, 43, 1200, 1800)),
          btnData('floor and the ice melt', ...pxDataToRelativeData(242, 959, 387, 43, 1200, 1800)),
          btnData('great weight', ...pxDataToRelativeData(397, 707, 224, 43, 1200, 1800)),
          btnData('of tons of', ...pxDataToRelativeData(831, 707, 121, 43, 1200, 1800)),
          btnData('up on the mountain', ...pxDataToRelativeData(132, 622, 160, 43, 1200, 1800)),
          btnData('all used', ...pxDataToRelativeData(486, 579, 142, 43, 1200, 1800)),
          btnData('mountains', ...pxDataToRelativeData(620, 1423, 175, 43, 1200, 1800)),
          btnData('of tons of', ...pxDataToRelativeData(132, 750, 49, 43, 1200, 1800)),
          btnData('talking', ...pxDataToRelativeData(324, 1421, 132, 43, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp8.jpg',
        'buttons': [
          btnData('in that way they', ...pxDataToRelativeData(621, 1379, 271, 43, 1200, 1800)),
          btnData('the', ...pxDataToRelativeData(151, 792, 59, 43, 1200, 1800)),
          btnData('giants', ...pxDataToRelativeData(683, 1000, 109, 43, 1200, 1800)),
          btnData('grumbling', ...pxDataToRelativeData(675, 835, 186, 43, 1200, 1800)),
          btnData('often', ...pxDataToRelativeData(355, 835, 89, 43, 1200, 1800)),
          btnData('and', ...pxDataToRelativeData(640, 285, 71, 43, 1200, 1800)),
          btnData('service berries', ...pxDataToRelativeData(766, 285, 191, 43, 1200, 1800)),
          btnData('service berries', ...pxDataToRelativeData(151, 328, 65, 43, 1200, 1800)),
          btnData('help me to remember', ...pxDataToRelativeData(335, 749, 402, 43, 1200, 1800)),
          btnData('of dirt and bits of wood', ...pxDataToRelativeData(438, 1422, 396, 43, 1200, 1800))
        ]
      },
      {
        'image': 'lilyp9.jpg',
        'buttons': [
          btnData('as if', ...pxDataToRelativeData(866, 1253, 89, 43, 1200, 1800)),
          btnData('crack', ...pxDataToRelativeData(312, 697, 102, 43, 1200, 1800)),
          btnData('as we see them today', ...pxDataToRelativeData(228, 1249, 364, 43, 1200, 1800)),
          btnData('mountain', ...pxDataToRelativeData(837, 401, 127, 43, 1200, 1800)),
          btnData('can see', ...pxDataToRelativeData(827, 230, 127, 43, 1200, 1800)),
          btnData('huge', ...pxDataToRelativeData(718, 1166, 96, 43, 1200, 1800)),
          btnData('its huge line', ...pxDataToRelativeData(609, 1123, 217, 43, 1200, 1800)),
          btnData('solid rock', ...pxDataToRelativeData(141, 227, 171, 43, 1200, 1800)),
          btnData('this all happened', ...pxDataToRelativeData(212, 358, 289, 43, 1200, 1800)),
          btnData('under the ground', ...pxDataToRelativeData(277, 444, 299, 43, 1200, 1800)),
          btnData('cracked', ...pxDataToRelativeData(773, 571, 139, 43, 1200, 1800)),
          btnData('mountain', ...pxDataToRelativeData(141, 444, 70, 43, 1200, 1800)),
          btnData('it did. when the', ...pxDataToRelativeData(194, 401, 322, 43, 1200, 1800)),
          btnData('began moving', ...pxDataToRelativeData(603, 1335, 247, 43, 1200, 1800)),
          btnData('a long', ...pxDataToRelativeData(141, 611, 120, 43, 1200, 1800)),
          btnData('its', ...pxDataToRelativeData(576, 1292, 53, 43, 1200, 1800))
        ]
      }
    ]

    // MAIN
    let poemSection = document.getElementById('issue3--poem')
    let spokenWord = wordToUtteranceDict(pages)

    pages.forEach((page) => {
      let pageDivParent = document.createElement('div')
      pageDivParent.style.position = 'relative'
      pageDivParent.style.maxWidth = '100%'
      addImg(page.image, pageDivParent)
      addBtns(page.buttons, pageDivParent)
      poemSection.appendChild(pageDivParent)
    })
  }
}
</script>
