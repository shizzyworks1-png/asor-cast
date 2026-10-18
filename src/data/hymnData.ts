import { HymnSong } from '../types/presentation';

export const DEFAULT_HYMNS: HymnSong[] = [
  {
    id: 'hymn-1',
    number: 1,
    title: 'Holy, Holy, Holy! Lord God Almighty',
    author: 'Reginald Heber (1826)',
    key: 'E♭',
    meter: '11.12.12.10',
    tags: ['Adoration', 'Trinity', 'Praise'],
    sections: [
      {
        id: 'h1-v1',
        label: 'Verse 1',
        content: 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy! merciful and mighty!\nGod in three Persons, blessed Trinity!'
      },
      {
        id: 'h1-v2',
        label: 'Verse 2',
        content: 'Holy, holy, holy! all the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWhich wert, and art, and evermore shalt be.'
      },
      {
        id: 'h1-v3',
        label: 'Verse 3',
        content: 'Holy, holy, holy! though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see;\nOnly Thou art holy; there is none beside Thee,\nPerfect in power, in love, and purity.'
      },
      {
        id: 'h1-v4',
        label: 'Verse 4',
        content: 'Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy Name, in earth, and sky, and sea;\nHoly, holy, holy; merciful and mighty!\nGod in three Persons, blessed Trinity!'
      }
    ]
  },
  {
    id: 'hymn-2',
    number: 2,
    title: 'Amazing Grace! How Sweet the Sound',
    author: 'John Newton (1779)',
    key: 'G',
    meter: 'C.M.',
    tags: ['Grace', 'Salvation', 'Assurance'],
    sections: [
      {
        id: 'h2-v1',
        label: 'Verse 1',
        content: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.'
      },
      {
        id: 'h2-v2',
        label: 'Verse 2',
        content: '\'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed!'
      },
      {
        id: 'h2-v3',
        label: 'Verse 3',
        content: 'Through many dangers, toils and snares,\nI have already come;\n\'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.'
      },
      {
        id: 'h2-v4',
        label: 'Verse 4',
        content: 'The Lord has promised good to me,\nHis Word my hope secures;\nHe will my Shield and Portion be,\nAs long as life endures.'
      },
      {
        id: 'h2-v5',
        label: 'Verse 5',
        content: 'When we\'ve been there ten thousand years,\nBright shining as the sun,\nWe\'ve no less days to sing God\'s praise\nThan when we\'d first begun.'
      }
    ]
  },
  {
    id: 'hymn-3',
    number: 3,
    title: 'Great Is Thy Faithfulness',
    author: 'Thomas O. Chisholm (1923)',
    key: 'D',
    meter: '11.10.11.10 with Refrain',
    tags: ['Faithfulness', 'Trust', 'Morning'],
    sections: [
      {
        id: 'h3-v1',
        label: 'Verse 1',
        content: 'Great is Thy faithfulness, O God my Father,\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions, they fail not;\nAs Thou hast been Thou forever wilt be.'
      },
      {
        id: 'h3-ref',
        label: 'Chorus',
        content: 'Great is Thy faithfulness! Great is Thy faithfulness!\nMorning by morning new mercies I see;\nAll I have needed Thy hand hath provided—\nGreat is Thy faithfulness, Lord, unto me!'
      },
      {
        id: 'h3-v2',
        label: 'Verse 2',
        content: 'Summer and winter, and springtime and harvest,\nSun, moon and stars in their courses above,\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love.'
      },
      {
        id: 'h3-v3',
        label: 'Verse 3',
        content: 'Pardon for sin and a peace that endureth,\nThine own dear presence to cheer and to guide;\nStrength for today and bright hope for tomorrow,\nBlessings all mine, with ten thousand beside!'
      }
    ]
  },
  {
    id: 'hymn-4',
    number: 4,
    title: 'How Great Thou Art',
    author: 'Carl Boberg / Stuart K. Hine (1949)',
    key: 'B♭',
    meter: '11.10.11.10 with Refrain',
    tags: ['Creation', 'Worship', 'Majesty'],
    sections: [
      {
        id: 'h4-v1',
        label: 'Verse 1',
        content: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed!'
      },
      {
        id: 'h4-chorus',
        label: 'Chorus',
        content: 'Then sings my soul, my Savior God, to Thee:\nHow great Thou art, how great Thou art!\nThen sings my soul, my Savior God, to Thee:\nHow great Thou art, how great Thou art!'
      },
      {
        id: 'h4-v2',
        label: 'Verse 2',
        content: 'When through the woods and forest glades I wander\nAnd hear the birds sing sweetly in the trees,\nWhen I look down from lofty mountain grandeur\nAnd hear the brook and feel the gentle breeze:'
      },
      {
        id: 'h4-v3',
        label: 'Verse 3',
        content: 'And when I think that God, His Son not sparing,\nSent Him to die, I scarce can take it in;\nThat on the cross, my burden gladly bearing,\nHe bled and died to take away my sin.'
      },
      {
        id: 'h4-v4',
        label: 'Verse 4',
        content: 'When Christ shall come with shout of acclamation\nAnd take me home, what joy shall fill my heart!\nThen I shall bow in humble adoration,\nAnd there proclaim: "My God, how great Thou art!"'
      }
    ]
  },
  {
    id: 'hymn-5',
    number: 5,
    title: 'Blessed Assurance, Jesus Is Mine!',
    author: 'Fanny J. Crosby (1873)',
    key: 'D',
    meter: '9.10.9.9 with Refrain',
    tags: ['Assurance', 'Joy', 'Praise'],
    sections: [
      {
        id: 'h5-v1',
        label: 'Verse 1',
        content: 'Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.'
      },
      {
        id: 'h5-chorus',
        label: 'Chorus',
        content: 'This is my story, this is my song,\nPraising my Savior all the day long;\nThis is my story, this is my song,\nPraising my Savior all the day long.'
      },
      {
        id: 'h5-v2',
        label: 'Verse 2',
        content: 'Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels descending bring from above\nEchoes of mercy, whispers of love.'
      },
      {
        id: 'h5-v3',
        label: 'Verse 3',
        content: 'Perfect submission, all is at rest,\nI in my Savior am happy and blest,\nWatching and waiting, looking above,\nFilled with His goodness, lost in His love.'
      }
    ]
  },
  {
    id: 'hymn-6',
    number: 6,
    title: 'It Is Well With My Soul',
    author: 'Horatio G. Spafford (1873)',
    key: 'C',
    meter: '11.8.11.9 with Refrain',
    tags: ['Peace', 'Comfort', 'Trial'],
    sections: [
      {
        id: 'h6-v1',
        label: 'Verse 1',
        content: 'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.'
      },
      {
        id: 'h6-chorus',
        label: 'Chorus',
        content: 'It is well (it is well)\nWith my soul (with my soul),\nIt is well, it is well with my soul.'
      },
      {
        id: 'h6-v2',
        label: 'Verse 2',
        content: 'Though Satan should buffet, though trials should come,\nLet this blest assurance control,\nThat Christ has regarded my helpless estate,\nAnd hath shed His own blood for my soul.'
      },
      {
        id: 'h6-v3',
        label: 'Verse 3',
        content: 'My sin—oh, the bliss of this glorious thought!—\nMy sin, not in part but the whole,\nIs nailed to the cross, and I bear it no more,\nPraise the Lord, praise the Lord, O my soul!'
      },
      {
        id: 'h6-v4',
        label: 'Verse 4',
        content: 'And Lord, haste the day when the faith shall be sight,\nThe clouds be rolled back as a scroll;\nThe trump shall resound, and the Lord shall descend,\nEven so, it is well with my soul.'
      }
    ]
  },
  {
    id: 'hymn-7',
    number: 7,
    title: 'To God Be the Glory',
    author: 'Fanny J. Crosby (1875)',
    key: 'A♭',
    meter: '11.11.11.11 with Refrain',
    tags: ['Praise', 'Redemption', 'Joy'],
    sections: [
      {
        id: 'h7-v1',
        label: 'Verse 1',
        content: 'To God be the glory, great things He hath done;\nSo loved He the world that He gave us His Son,\nWho yielded His life an atonement for sin,\nAnd opened the life gate that all may go in.'
      },
      {
        id: 'h7-chorus',
        label: 'Chorus',
        content: 'Praise the Lord, praise the Lord,\nLet the earth hear His voice!\nPraise the Lord, praise the Lord,\nLet the people rejoice!\nO come to the Father, through Jesus the Son,\nAnd give Him the glory, great things He hath done.'
      },
      {
        id: 'h7-v2',
        label: 'Verse 2',
        content: 'O perfect redemption, the purchase of blood,\nTo every believer the promise of God;\nThe vilest offender who truly believes,\nThat moment from Jesus a pardon receives.'
      },
      {
        id: 'h7-v3',
        label: 'Verse 3',
        content: 'Great things He hath taught us, great things He hath done,\nAnd great our rejoicing through Jesus the Son;\nBut purer, and higher, and greater will be\nOur wonder, our transport, when Jesus we see.'
      }
    ]
  },
  {
    id: 'hymn-8',
    number: 8,
    title: 'In Christ Alone',
    author: 'Stuart Townend & Keith Getty (2001)',
    key: 'D',
    meter: 'L.M.',
    tags: ['Christ', 'Resurrection', 'Security'],
    sections: [
      {
        id: 'h8-v1',
        label: 'Verse 1',
        content: 'In Christ alone my hope is found,\nHe is my light, my strength, my song;\nThis cornerstone, this solid ground,\nFirm through the fiercest drought and storm.\nWhat heights of love, what depths of peace,\nWhen fears are stilled, when strivings cease!\nMy comforter, my all in all—\nHere in the love of Christ I stand.'
      },
      {
        id: 'h8-v2',
        label: 'Verse 2',
        content: 'In Christ alone, who took on flesh,\nFullness of God in helpless babe!\nThis gift of love and righteousness,\nScorned by the ones He came to save.\nTill on that cross as Jesus died,\nThe wrath of God was satisfied;\nFor ev\'ry sin on Him was laid—\nHere in the death of Christ I live.'
      },
      {
        id: 'h8-v3',
        label: 'Verse 3',
        content: 'There in the ground His body lay,\nLight of the world by darkness slain;\nThen bursting forth in glorious day,\nUp from the grave He rose again!\nAnd as He stands in victory,\nSin\'s curse has lost its grip on me;\nFor I am His and He is mine—\nBought with the precious blood of Christ.'
      },
      {
        id: 'h8-v4',
        label: 'Verse 4',
        content: 'No guilt in life, no fear in death—\nThis is the pow\'r of Christ in me;\nFrom life\'s first cry to final breath,\nJesus commands my destiny.\nNo pow\'r of hell, no scheme of man,\nCan ever pluck me from His hand;\nTill He returns or calls me home—\nHere in the pow\'r of Christ I\'ll stand.'
      }
    ]
  },
  {
    id: 'hymn-9',
    number: 9,
    title: '10,000 Reasons (Bless The Lord)',
    author: 'Matt Redman & Jonas Myrin (2011)',
    key: 'G',
    meter: 'Contemporary',
    tags: ['Praise', 'Blessing', 'Worship'],
    sections: [
      {
        id: 'h9-chorus',
        label: 'Chorus',
        content: 'Bless the Lord, O my soul, O my soul,\nWorship His holy name.\nSing like never before, O my soul,\nI\'ll worship Your holy name.'
      },
      {
        id: 'h9-v1',
        label: 'Verse 1',
        content: 'The sun comes up, it\'s a new day dawning;\nIt\'s time to sing Your song again.\nWhatever may pass, and whatever lies before me,\nLet me be singing when the evening comes.'
      },
      {
        id: 'h9-v2',
        label: 'Verse 2',
        content: 'You\'re rich in love, and You\'re slow to anger.\nYour name is great, and Your heart is kind.\nFor all Your goodness, I will keep on singing;\nTen thousand reasons for my heart to find.'
      },
      {
        id: 'h9-v3',
        label: 'Verse 3',
        content: 'And on that day when my strength is failing,\nThe end draws near and my time has come;\nStill my soul will sing Your praise unending,\nTen thousand years and then forevermore.'
      }
    ]
  },
  {
    id: 'hymn-10',
    number: 10,
    title: 'What a Friend We Have in Jesus',
    author: 'Joseph M. Scriven (1855)',
    key: 'F',
    meter: '8.7.8.7.D',
    tags: ['Prayer', 'Friendship', 'Trials'],
    sections: [
      {
        id: 'h10-v1',
        label: 'Verse 1',
        content: 'What a friend we have in Jesus,\nAll our sins and griefs to bear!\nWhat a privilege to carry\nEverything to God in prayer!\nO what peace we often forfeit,\nO what needless pain we bear,\nAll because we do not carry\nEverything to God in prayer!'
      },
      {
        id: 'h10-v2',
        label: 'Verse 2',
        content: 'Have we trials and temptations?\nIs there trouble anywhere?\nWe should never be discouraged;\nTake it to the Lord in prayer.\nCan we find a friend so faithful,\nWho will all our sorrows share?\nJesus knows our every weakness;\nTake it to the Lord in prayer.'
      },
      {
        id: 'h10-v3',
        label: 'Verse 3',
        content: 'Are we weak and heavy laden,\nCumbered with a load of care?\nPrecious Savior, still our refuge;\nTake it to the Lord in prayer.\nDo thy friends despise, forsake thee?\nTake it to the Lord in prayer!\nIn His arms He\'ll take and shield thee;\nThou wilt find a solace there.'
      }
    ]
  }
];
