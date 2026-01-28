const fs = require('fs');

// Expanded personality trait components
const components = {
  positive: [
    'Friendly and welcoming', 'Honest to a fault', 'Generous with time and money', 'Fiercely loyal',
    'Optimistic and cheerful', 'Patient and understanding', 'Brave and courageous', 'Humble and modest',
    'Curious and eager to learn', 'Protective of the weak', 'Compassionate', 'Empathetic',
    'Trustworthy', 'Reliable', 'Dependable', 'Considerate', 'Thoughtful', 'Kind-hearted',
    'Gentle', 'Caring', 'Nurturing', 'Supportive', 'Encouraging', 'Inspiring', 'Motivating',
    'Enthusiastic', 'Energetic', 'Passionate', 'Dedicated', 'Committed', 'Devoted',
    'Hardworking', 'Diligent', 'Industrious', 'Ambitious in a healthy way', 'Determined',
    'Persistent', 'Resilient', 'Strong-willed', 'Confident', 'Self-assured', 'Poised',
    'Graceful', 'Elegant', 'Refined', 'Cultured', 'Sophisticated', 'Worldly', 'Wise',
    'Intelligent', 'Clever', 'Quick-witted', 'Sharp-minded', 'Insightful', 'Perceptive',
    'Observant', 'Attentive', 'Mindful', 'Aware', 'Conscientious', 'Meticulous',
    'Detail-oriented', 'Organized', 'Methodical', 'Systematic', 'Efficient', 'Productive',
    'Creative', 'Imaginative', 'Innovative', 'Inventive', 'Artistic', 'Talented',
    'Skilled', 'Gifted', 'Capable', 'Competent', 'Proficient', 'Adept', 'Masterful',
    'Charismatic', 'Charming', 'Engaging', 'Magnetic', 'Captivating', 'Alluring',
    'Pleasant', 'Agreeable', 'Amiable', 'Affable', 'Genial', 'Cordial', 'Warm',
    'Open-minded', 'Accepting', 'Tolerant', 'Inclusive', 'Welcoming to all', 'Non-judgmental',
    'Fair', 'Just', 'Equitable', 'Impartial', 'Objective', 'Unbiased', 'Balanced',
    'Forgiving', 'Merciful', 'Lenient', 'Understanding of mistakes', 'Second-chance giver',
    'Selfless', 'Altruistic', 'Charitable', 'Philanthropic', 'Giving', 'Sharing',
    'Cooperative', 'Collaborative', 'Team-oriented', 'Helpful', 'Accommodating',
    'Flexible', 'Adaptable', 'Versatile', 'Resourceful', 'Ingenious', 'Pragmatic in a good way',
    'Level-headed', 'Calm', 'Composed', 'Collected', 'Serene', 'Peaceful', 'Tranquil',
    'Playful', 'Fun-loving', 'Lighthearted', 'Jovial', 'Merry', 'Joyful', 'Gleeful',
    'Sincere', 'Genuine', 'Authentic', 'True to themselves', 'Straightforward', 'Direct in a kind way',
    'Respectful', 'Courteous', 'Polite', 'Well-mannered', 'Dignified', 'Noble',
    'Honorable', 'Principled', 'Ethical', 'Moral', 'Righteous', 'Virtuous', 'Good-natured',
    'Pure-hearted', 'Innocent in a good way', 'Uncorrupted', 'Clean-living', 'Wholesome'
  ],
  neutral: [
    'Cautious and careful', 'Quiet and observant', 'Practical and pragmatic', 'Traditional and set in ways',
    'Ambitious and driven', 'Independent and self-reliant', 'Blunt and direct', 'Superstitious',
    'Nostalgic for the past', 'Obsessed with a hobby', 'Reserved', 'Introverted', 'Private',
    'Secretive', 'Mysterious', 'Enigmatic', 'Aloof', 'Detached', 'Distant', 'Impersonal',
    'Professional', 'Business-like', 'Formal', 'Proper', 'Conventional', 'Orthodox',
    'Conservative', 'Old-fashioned', 'Outdated in views', 'Modern', 'Progressive',
    'Forward-thinking', 'Futuristic', 'Avant-garde', 'Experimental', 'Unconventional',
    'Eccentric', 'Quirky', 'Odd', 'Peculiar', 'Strange', 'Weird', 'Unusual',
    'Unique', 'Individual', 'Non-conformist', 'Rebellious spirit', 'Free-spirited',
    'Spontaneous', 'Impulsive', 'Reckless', 'Daring', 'Adventurous', 'Risk-taking',
    'Thrill-seeking', 'Adrenaline junkie', 'Competitive', 'Driven to win', 'Perfectionistic',
    'High standards', 'Demanding', 'Exacting', 'Fastidious', 'Particular', 'Picky',
    'Selective', 'Discriminating', 'Choosy', 'Finicky', 'Fussy', 'Hard to please',
    'Stoic', 'Unemotional', 'Unflappable', 'Impassive', 'Expressionless', 'Deadpan',
    'Serious', 'Solemn', 'Somber', 'Grave', 'Stern', 'Austere', 'Ascetic',
    'Minimalist', 'Simple', 'Plain', 'Unadorned', 'Basic', 'Spartan', 'Frugal',
    'Thrifty', 'Economical', 'Budget-conscious', 'Penny-pinching', 'Cost-aware',
    'Materialistic', 'Wealth-focused', 'Status-conscious', 'Image-conscious', 'Vain about appearance',
    'Scholarly', 'Academic', 'Bookish', 'Studious', 'Learned', 'Educated', 'Well-read',
    'Philosophical', 'Contemplative', 'Reflective', 'Introspective', 'Meditative', 'Thoughtful',
    'Analytical', 'Logical', 'Rational', 'Reasonable', 'Sensible', 'Sound-minded',
    'Skeptical', 'Doubting', 'Questioning', 'Cynical', 'Jaded', 'World-weary',
    'Experienced', 'Seasoned', 'Veteran', 'Battle-tested', 'Street-smart', 'Savvy',
    'Shrewd', 'Calculating', 'Strategic', 'Tactical', 'Methodical in thinking',
    'Routine-oriented', 'Habitual', 'Ritualistic', 'Ceremonial', 'Formal in habits',
    'Punctual', 'Timely', 'Prompt', 'Early', 'Late', 'Tardy', 'Slow-paced',
    'Fast-paced', 'Hurried', 'Rushed', 'Busy', 'Overworked', 'Stressed', 'Tense',
    'Relaxed', 'Laid-back', 'Easy-going', 'Chill', 'Mellow', 'Low-key', 'Understated',
    'Modest in demeanor', 'Unassuming', 'Low-profile', 'Prefers background', 'Avoids spotlight'
  ],
  negative: [
    'Suspicious of strangers', 'Greedy and miserly', 'Arrogant and condescending', 'Hot-tempered and quick to anger',
    'Cowardly when threatened', 'Gossipy and indiscreet', 'Lazy and unmotivated', 'Jealous of others\' success',
    'Deceitful and manipulative', 'Bitter about past wrongs', 'Dishonest', 'Lying', 'Untrustworthy',
    'Unreliable', 'Flaky', 'Inconsistent', 'Unpredictable', 'Erratic', 'Unstable',
    'Volatile', 'Explosive', 'Violent', 'Aggressive', 'Hostile', 'Belligerent',
    'Confrontational', 'Argumentative', 'Combative', 'Quarrelsome', 'Contentious',
    'Mean-spirited', 'Cruel', 'Sadistic', 'Malicious', 'Spiteful', 'Vindictive',
    'Vengeful', 'Retaliatory', 'Grudge-holding', 'Unforgiving', 'Merciless', 'Ruthless',
    'Callous', 'Heartless', 'Cold-blooded', 'Insensitive', 'Inconsiderate', 'Thoughtless',
    'Selfish', 'Self-centered', 'Self-absorbed', 'Narcissistic', 'Egotistical', 'Vain',
    'Conceited', 'Pompous', 'Haughty', 'Snobbish', 'Elitist', 'Superior-acting',
    'Condescending to others', 'Patronizing', 'Dismissive', 'Contemptuous', 'Disdainful',
    'Scornful', 'Mocking', 'Ridiculing', 'Bullying', 'Intimidating', 'Threatening',
    'Coercive', 'Controlling', 'Domineering', 'Overbearing', 'Bossy', 'Dictatorial',
    'Tyrannical', 'Authoritarian', 'Oppressive', 'Repressive', 'Restrictive',
    'Paranoid', 'Distrustful', 'Fearful', 'Anxious', 'Nervous', 'Worried', 'Panicky',
    'Timid', 'Meek', 'Spineless', 'Weak-willed', 'Pushover', 'Easily influenced',
    'Gullible', 'Naive', 'Foolish', 'Stupid', 'Dim-witted', 'Slow', 'Dense',
    'Ignorant', 'Uneducated', 'Uncultured', 'Uncouth', 'Crude', 'Vulgar', 'Crass',
    'Rude', 'Impolite', 'Discourteous', 'Disrespectful', 'Insolent', 'Impertinent',
    'Impudent', 'Cheeky', 'Sassy', 'Fresh', 'Mouthy', 'Talks back', 'Defiant',
    'Disobedient', 'Rebellious in a bad way', 'Insubordinate', 'Mutinous',
    'Stubborn', 'Obstinate', 'Headstrong', 'Willful', 'Intractable', 'Inflexible',
    'Rigid', 'Unbending', 'Unyielding', 'Uncompromising', 'Dogmatic', 'Zealous',
    'Fanatical', 'Extremist', 'Radical', 'Militant', 'Warlike', 'Bloodthirsty',
    'Predatory', 'Exploitative', 'Parasitic', 'Opportunistic', 'Scheming', 'Conniving',
    'Devious', 'Underhanded', 'Sneaky', 'Sly', 'Cunning in a bad way', 'Treacherous',
    'Traitorous', 'Disloyal', 'Unfaithful', 'Adulterous', 'Promiscuous', 'Lewd',
    'Lustful', 'Perverse', 'Depraved', 'Debauched', 'Dissolute', 'Licentious',
    'Hedonistic', 'Indulgent', 'Gluttonous', 'Excessive', 'Wasteful', 'Extravagant',
    'Careless', 'Negligent', 'Irresponsible', 'Reckless with others', 'Destructive',
    'Vandalistic', 'Disruptive', 'Troublemaking', 'Rabble-rousing', 'Inciting',
    'Inflammatory', 'Provocative', 'Offensive', 'Insulting', 'Abrasive', 'Abusive',
    'Toxic', 'Poisonous personality', 'Draining to be around', 'Exhausting', 'Annoying',
    'Irritating', 'Grating', 'Obnoxious', 'Insufferable', 'Intolerable', 'Unbearable'
  ],
  quirks: [
    'Obsessed with cleanliness', 'Collects strange objects', 'Always quoting literature', 'Speaks in rhyme',
    'Cannot resist a good riddle', 'Gambler who can\'t quit', 'Believes in every omen', 'Hoarder',
    'Germaphobe', 'Superstitious about numbers', 'Names all their possessions', 'Talks to animals',
    'Afraid of magic', 'Draws in margins constantly', 'Counts things compulsively', 'Arranges things by color',
    'Must touch doorframes', 'Never sits with back to door', 'Samples food before serving', 'Chews on things',
    'Carries lucky charm everywhere', 'Knocks on wood constantly', 'Avoids cracks in floor', 'Must sit in same spot',
    'Rearranges furniture obsessively', 'Collects buttons', 'Saves string and twine', 'Never throws anything away',
    'Picks at scabs', 'Cracks every joint', 'Hums nervously', 'Whistles cheerfully', 'Sings to themselves',
    'Talks to inanimate objects', 'Names their weapons', 'Apologizes to furniture when bumping it',
    'Refuses to eat certain foods', 'Only eats certain colors', 'Vegetarian', 'Carnivore only',
    'Won\'t drink water', 'Only drinks specific beverage', 'Sniffs everything first', 'Tastes everything',
    'Touches everything', 'Must examine all objects', 'Insatiably curious', 'Asks too many questions',
    'Interrupts constantly', 'Finishes others\' sentences', 'Speaks in third person', 'Uses big words incorrectly',
    'Mispronounces common words', 'Has unusual accent', 'Speaks multiple languages badly', 'Code-switches constantly',
    'Uses outdated slang', 'Makes up new words', 'Repeats last word', 'Echoes others', 'Parrots phrases',
    'Quotes authorities constantly', 'Name-drops excessively', 'Bragging constantly', 'Self-deprecating humor',
    'Dad jokes only', 'Puns incessantly', 'Sarcastic about everything', 'Takes everything literally',
    'Misses all sarcasm', 'Doesn\'t understand jokes', 'Laughs at wrong times', 'Never laughs',
    'Giggles inappropriately', 'Snorts when laughing', 'Cackles evilly', 'Has infectious laugh',
    'Cries easily', 'Never shows emotion', 'Wears emotions on sleeve', 'Mood swings wildly',
    'Always optimistic', 'Perpetually pessimistic', 'Chronically bored', 'Easily excited',
    'Overreacts to everything', 'Underreacts to danger', 'Fearless to a fault', 'Afraid of everything',
    'Specific phobia', 'Loves heights', 'Afraid of heights', 'Claustrophobic', 'Agoraphobic',
    'Afraid of dark', 'Afraid of water', 'Can\'t swim', 'Swims at every opportunity',
    'Must bathe daily', 'Never bathes', 'Perfume overuser', 'Refuses perfume', 'Natural scents only',
    'Allergic to everything', 'Never gets sick', 'Hypochondriac', 'Ignores all illness',
    'Self-medicates constantly', 'Refuses all medicine', 'Herbal remedies only', 'Bleeds easily',
    'Heals remarkably fast', 'Scars easily', 'Never scars', 'Picks at wounds',
    'Overprotective of others', 'Recklessly endangers self', 'Martyr complex', 'Savior complex',
    'Victim mentality', 'Blame-shifter', 'Takes credit for everything', 'Gives credit away'
  ]
};

function generateCombinations(traitArray) {
  const combinations = new Set();
  
  // Add all single traits
  traitArray.forEach(trait => combinations.add(trait));
  
  // Add two-trait combinations within the same category
  for (let i = 0; i < traitArray.length; i++) {
    for (let j = i + 1; j < traitArray.length; j++) {
      combinations.add(`${traitArray[i]}; ${traitArray[j]}`);
    }
  }
  
  // Add three-trait combinations within the same category
  for (let i = 0; i < traitArray.length; i++) {
    for (let j = i + 1; j < traitArray.length; j++) {
      for (let k = j + 1; k < traitArray.length; k++) {
        combinations.add(`${traitArray[i]}; ${traitArray[j]}; ${traitArray[k]}`);
      }
    }
  }
  
  return Array.from(combinations);
}

console.log('Generating personality data...');

const data = {
  name: "NPC Personalities",
  description: "Personality traits for NPCs, can combine 2-3",
  positive: generateCombinations(components.positive),
  neutral: generateCombinations(components.neutral),
  negative: generateCombinations(components.negative),
  quirks: generateCombinations(components.quirks)
};

console.log(`Generated counts:
  - positive: ${data.positive.length}
  - neutral: ${data.neutral.length}
  - negative: ${data.negative.length}
  - quirks: ${data.quirks.length}
  Total: ${data.positive.length + data.neutral.length + data.negative.length + data.quirks.length}`);

// Write to file
fs.writeFileSync('data/npc/personalities.json', JSON.stringify(data, null, 2));
console.log('✓ Written to data/npc/personalities.json');
