import json
import re
from itertools import cycle
from pathlib import Path

README_PATH = Path('public/extensions/CRYPTIDS_EXPANSION_README.md')
DATA_PATH = Path('public/extensions/cryptids.json')

README_TEXT = README_PATH.read_text()

# Parse Appendix D cryptid descriptions
appendix_d_start = README_TEXT.index('#### A–D')
appendix_d_text = README_TEXT[appendix_d_start:]
cryptid_entries = re.findall(r"- \*\*(.+?)\*\*:\s*(.+?)\n", appendix_d_text)
cryptid_info = {}
for name, desc in cryptid_entries:
    clean = name.split('(')[0].strip()
    first_sentence = desc.split('. ')[0].strip().rstrip('.')
    cryptid_info[clean.lower()] = first_sentence

# Parse Appendix C state cryptid mapping
appendix_c_start = README_TEXT.index('#### Northeast & Mid-Atlantic')
appendix_c_text = README_TEXT[appendix_c_start:]
state_entries = re.findall(r"- \*\*(.+?) — (.+?)\*\*:\s*(.+?)\n", appendix_c_text)
state_cryptids = {}
for state, cryptid, desc in state_entries:
    clean_state = state.strip().lower()
    cryptid_name = cryptid.split('(')[0].strip()
    first_sentence = desc.split('. ')[0].strip().rstrip('.')
    state_cryptids[clean_state] = {
        'cryptid': cryptid_name,
        'desc': first_sentence,
    }

# Manual descriptors for cryptids not present in Appendix D
manual_cryptids = {
    'champ': "Lake Champlain's mascot keeps bobbing between border checkpoints like it's dodging customs",
    'dogman': "Midwest patrols report a bipedal wolf pacing tree lines and counting coup on squad cars",
    'hopkinsville goblins': "Kentucky farmhouses still log metallic-skinned visitors tapping on windows at dusk",
    'kelly-hopkinsville goblins': "Kentucky farmhouses still log metallic-skinned visitors tapping on windows at dusk",
    'lake monster': "Boat crews swear something serpentine keeps photo-bombing sonar sweeps across inland lakes",
    'montauk monster': "Shoreline cleanup crews wheel out a bloated lab experiment with too many teeth for the tabloids to ignore",
    'wood devils': "New Hampshire lumber camps report bark-colored lurkers hugging trunks until the coast is clear",
    'wood devil': "New Hampshire lumber camps report bark-colored lurkers hugging trunks until the coast is clear",
    'operation paperclip': "Captured rocket scientists keep filing expense reports under assumed names and classified stationery",
    'operation paperclip ii': "The sequel program insists its imported geniuses definitely aren't hiding UFO patents in desk drawers",
    'reptilian shapeshifter agent': "Capitol interns whisper about staffers whose pupils slit whenever the cameras cut away",
}

cryptid_info.update(manual_cryptids)

# Synonyms to map card references to cryptid keys
cryptid_synonyms = {
    'bigfoot': 'bigfoot',
    'bigfoot expedition': 'bigfoot',
    'bigfoot field operations': 'bigfoot',
    'champ': 'champ',
    'champ budget audit': 'champ',
    'champ watch patrols': 'champ',
    'dogman': 'dogman',
    'dogman mass sighting': 'dogman',
    'dogman panic wave': 'dogman',
    'dogman area closure': 'dogman',
    'hopkinsville goblins': 'hopkinsville goblins',
    'kelly–hopkinsville goblins': 'hopkinsville goblins',
    'kelly-hopkinsville goblins': 'hopkinsville goblins',
    'wood devils': 'wood devils',
    'wood devils mass sighting': 'wood devils',
    'wood devil': 'wood devil',
    'lake monster': 'lake monster',
    'lake monster sonar evidence': 'lake monster',
    'lake monster drainage': 'lake monster',
    'montauk monster': 'montauk monster',
    'montauk monster mass sighting': 'montauk monster',
    'montauk monster area closure': 'montauk monster',
    'montauk monster panic wave': 'montauk monster',
    'operation paperclip files': 'operation paperclip',
    'operation paperclip ii': 'operation paperclip ii',
    'reptilian shapeshifter agent': 'reptilian shapeshifter agent',
}

# Build quick lookup for all cryptid names (including synonyms)
for name in list(cryptid_info.keys()):
    cryptid_synonyms.setdefault(name, name)

# Additional descriptors for thematic keywords
keyword_flavor = {
    'ufo': 'Radar techs swear the saucers spelled out tomorrow\'s lottery numbers before vanishing.',
    'alien': 'Abductees compare scars under black light and demand hazard pay on camera.',
    'portal': 'Engineers tape over glowing rifts with OSHA signage and hopeful duct tape.',
    'time traveler': 'Future-tense alibis collapse under contradictory receipts and outdated slang.',
    'interdimensional': 'Dimensional customs confiscates seven suitcases of contraband timelines.',
    'hollow earth': 'Survey teams keep losing drones to tropical breezes rising from the mineshaft.',
    'psychic': 'Remote viewers report migraines shaped like classified coordinates.',
    'chemtrail': 'Contrails spell apology letters before the jet disappears into unnatural fog.',
    'mind': 'HR adds “clairvoyant hazard pay” paperwork to the onboarding packet.',
    'shadow government': 'Anonymous insiders fax us outlines already soaked in invisible ink.',
    'consciousness': 'Meditation influencers promise the secret password to the universal group chat.',
    'remote viewing': 'Sofa-bound prophets sketch accurate blueprints of places they swear they never visited.',
    'implant': 'Clinic trays overflow with blinking metal souvenirs no brand wants to claim.',
    'late night': 'AM radio callers form a union demanding overtime for midnight revelations.',
    'viral': 'Thread moderators barricade the comments with freshly encrypted memes.',
    'cryptid': 'Field researchers staple fresh plaster casts over every bulletin board in reach.',
    'expedition': 'The expedition liveblog pauses only to refuel on diner coffee and righteous outrage.',
    'ghost': 'Cold spots form around the copy desk while we edit the EVP transcript.',
    'monster': 'Costumed mascots protest outside, insisting the headline stole their look.',
    'prophecies': 'Bridge commuters time their detours to the omen schedule we keep publishing.',
    'implant removal': 'Patients leave clutching jars of humming alloys labeled “evidence.”',
}

truth_intros = [
    'Hotline meltdown:',
    'Tabloid extras scream:',
    'Citizen scanners shriek:',
    'Camcorder club bulletins:',
    'Basement newsroom update:',
    'Flyer-run blog posts:',
    'Ham radio net crackles:',
    'Late-night livestream blurts:',
    'Tin-foil editorial note:',
    'Paranoid Times push alert:',
    'Garage printers whirr:',
    'Zine collective dispatch:',
    'Conspiracy beat whispers:',
    'Witness brunch recap:',
    'DIY newswire siren:',
    'Anonymous tip jar overflow:',
    'Field correspondent scribbles:',
    'Backyard seance minutes:',
    'Payphone gossip spiral:',
    'Message-board prophecy drop:',
]

government_intros = [
    'Bureau memo leak:',
    'Official bulletin draft:',
    'Containment directive:',
    'Logistics redline:',
    'Security clearance whisper:',
    'Department press rehearsal:',
    'Agency incident report:',
    'Compliance footnote:',
    'Command center aside:',
    'Internal affairs reminder:',
    'Procurement addendum:',
    'Public affairs talking point:',
    'Enforcement briefing note:',
    'Surveillance log entry:',
    'Budget office tantrum:',
    'Operations fax at 3AM:',
    'Disaster drill script:',
    'Legal counsel margin:',
    'Senate oversight shrug:',
    'Archives intake summary:',
]

truth_closings = [
    'Editors staple fresh foil to the front page.',
    'Street teams hawk papers before dawn curfew.',
    'The newsroom bets on how fast the livestream crashes.',
    'Graffiti crews stencil it across the courthouse.',
    'Ham radios won\'t stop buzzing for quotes.',
    'Aunties on Facebook swear it\'s the prophecy clock.',
    'We run the story twice just to spite the censors.',
    'Zine racks empty faster than black helicopters hover.',
    'Next print run includes glow-in-the-dark ink.',
    'Fact-checkers shrug and order more coffee.',
    'We staple a coupon for anti-surveillance shades.',
    'Conspiracy interns start the parade route map.',
    'The hotline volunteers high-five between calls.',
    'Disinformation bots rage-click in the comments.',
    'We frame the negatives with freshly stolen duct tape.',
    'Raccoons outside the office nod in agreement.',
    'We archive it under "inevitable vindication."',
    'Pizza arrives with a handwritten “told you so.”',
    'Our red string board gains three new layers.',
    'Someone starts pre-selling commemorative tabloids.',
]

government_closings = [
    'Central office attaches three redacted appendices.',
    'Public affairs rehearses the “nothing to see” line.',
    'Budget hawks demand receipts before sunrise.',
    'Command schedules a morale webinar for staff.',
    'Legal reminds everyone this never officially happened.',
    'The press desk files it under seasonal anomalies.',
    'Logistics orders extra barricade tape just in case.',
    'The memo self-destructs after six bored signatures.',
    'Agency spokesbots schedule a denial tour.',
    'Archivists stamp it “routine wildlife incident.”',
    'Risk management drafts a new acronym for the mess.',
    'The cafeteria menu quietly adds blackout coffee.',
    'Interns update the color-coded panic binder.',
    'The phones reroute straight to patriotic hold music.',
    'Satellite time gets reassigned to weather balloons.',
    'HR circulates a stress survey with no checkbox for “cryptid.”',
    'Someone orders extra caution tape shaped like barbed wire.',
    'The governor\'s office prepares a shrugging emoji tweet.',
    'Procurement starts bulk-buying industrial-sized sage bundles.',
    'They schedule a follow-up meeting titled “Routine Fog.”',
]

truth_intro_cycle = cycle(truth_intros)
truth_closing_cycle = cycle(truth_closings)
government_intro_cycle = cycle(government_intros)
government_closing_cycle = cycle(government_closings)

intro_counters = {'truth': 0, 'government': 0}
closing_counters = {'truth': 0, 'government': 0}


def next_intro(faction: str) -> str:
    if faction == 'government':
        intro = government_intros[intro_counters['government'] % len(government_intros)]
        intro_counters['government'] += 1
        return intro
    intro = truth_intros[intro_counters['truth'] % len(truth_intros)]
    intro_counters['truth'] += 1
    return intro


def next_closing(faction: str) -> str:
    if faction == 'government':
        closing = government_closings[closing_counters['government'] % len(government_closings)]
        closing_counters['government'] += 1
        return closing
    closing = truth_closings[closing_counters['truth'] % len(truth_closings)]
    closing_counters['truth'] += 1
    return closing


def slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = slug.replace('–', '-')
    slug = slug.replace('—', '-')
    slug = re.sub(r"[^a-z0-9]+", '-', slug)
    slug = re.sub(r"-+", '-', slug)
    return slug.strip('-')


def find_state_data(prefix: str):
    state_key = prefix.lower().replace('cryptid', '').strip()
    return state_cryptids.get(state_key)


def find_cryptid_key(name: str):
    lower = name.lower().strip()
    lower = lower.replace('–', '-')
    if lower in cryptid_synonyms:
        return cryptid_synonyms[lower]
    for key in cryptid_synonyms:
        if key in lower:
            return cryptid_synonyms[key]
    return None


def describe_cryptid(key: str) -> str:
    info = cryptid_info.get(key)
    if info:
        return info
    return None


def keyword_body(name: str) -> str:
    lower = name.lower()
    for keyword, line in keyword_flavor.items():
        if keyword in lower:
            return line
    return None


def build_body(card, state_data, cryptid_key, suffix, prefix):
    name = card['name']
    if suffix == 'Mass Sighting':
        if state_data:
            cryptid_name = state_data['cryptid']
            desc = state_data['desc']
            state_label = prefix.replace('Cryptid', '').strip()
            return f"{state_label} phone lines erupt as locals swear {cryptid_name} is on parade—{desc}."
        if cryptid_key:
            desc = describe_cryptid(cryptid_key)
            if desc:
                return f"Witness maps fill with pins claiming {desc.lower() if desc[0].isupper() else desc}."
    if suffix == 'Wildlife Advisory' and state_data:
        cryptid_name = state_data['cryptid']
        desc = state_data['desc']
        return f"{prefix} wildlife offices quietly brief lawmakers that {cryptid_name} is back in season—{desc}."
    if suffix in {'Panic Wave', 'Area Closure', 'Budget Audit', 'Perimeter Lockdown', 'Protocol'} and cryptid_key:
        desc = describe_cryptid(cryptid_key)
        if desc:
            if suffix == 'Panic Wave':
                return f"Crowd-control fails as the legend spreads; {desc}."
            if suffix == 'Area Closure':
                return f"Barricades sprout overnight because {desc.lower() if desc[0].isupper() else desc}."
            if suffix == 'Budget Audit':
                return f"Accountants circle expenditures linked to {desc.lower() if desc[0].isupper() else desc}."
            if suffix == 'Perimeter Lockdown':
                return f"Security rings the zone twice; {desc.lower() if desc[0].isupper() else desc}."
            if suffix == 'Protocol':
                return f"Emergency binders add a tab labelled '{name.split()[0]}', citing how {desc.lower() if desc[0].isupper() else desc}."
    if cryptid_key:
        desc = describe_cryptid(cryptid_key)
        if desc:
            snippet = desc[0].lower() + desc[1:] if desc and desc[0].isupper() else desc
            return f"Sources insist that {snippet}."
    keyword_line = keyword_body(name)
    if keyword_line:
        return keyword_line
    return f"{name} just became the strangest lead on the corkboard this week."


def ensure_cryptid_tag(card, state_data, cryptid_key):
    tags = list(dict.fromkeys(card.get('tags', [])))
    candidate = None
    if cryptid_key and cryptid_key not in {'operation paperclip', 'operation paperclip ii', 'reptilian shapeshifter agent'}:
        candidate = slugify(cryptid_key)
    elif state_data:
        candidate = slugify(state_data['cryptid'])
    if candidate:
        if candidate.endswith('lake-monster') and candidate != 'lake-monster':
            tags = [t for t in tags if t != 'lake-monster']
        if candidate not in tags:
            tags.append(candidate)
    card['tags'] = tags


def main():
    data = json.loads(DATA_PATH.read_text())
    for card in data['cards']:
        name = card['name']
        suffix = None
        for label in ['Mass Sighting', 'Wildlife Advisory', 'Panic Wave', 'Area Closure', 'Budget Audit', 'Perimeter Lockdown', 'Protocol']:
            if name.endswith(label):
                suffix = label
                break
        prefix = name[:-len(suffix)].strip() if suffix else ''
        state_data = find_state_data(prefix) if suffix in {'Mass Sighting', 'Wildlife Advisory'} else None
        cryptid_key = find_cryptid_key(name)
        if not cryptid_key and state_data:
            cryptid_key = find_cryptid_key(state_data['cryptid'])
        body = build_body(card, state_data, cryptid_key, suffix, prefix)
        intro = next_intro(card['faction'])
        closing = next_closing(card['faction'])
        card['flavor'] = f"{intro} {body} {closing}"
        ensure_cryptid_tag(card, state_data, cryptid_key)
    DATA_PATH.write_text(json.dumps(data, indent=2) + "\n")


if __name__ == '__main__':
    main()
