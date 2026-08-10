# Screen Inventory V2

Legend: **Public** requires no account; **Soft gate** is public preview with auth on personal action; **Auth** requires an authenticated user; **Conditional** adds safety/program eligibility requirements.

| Screen | Purpose | Actor | Primary action | Secondary action | Auth | Key data | Core components | Mobile behavior |
|---|---|---|---|---|---|---|---|---|
| Splash | Brand/value entry | All | Continue | — | Public | None | SafeAreaShell, BrandMark | Short, no scroll |
| Welcome | Choose Explore or sign in | Guest/returning | Jelajahi SARIRA | Masuk | Public | None | MobileScreen, Button | Two clear actions |
| Explore Home | Demonstrate value | Guest | Mulai Program Saya | Browse feature | Public | Curated public content | AppHeader, ProgramCard | Single-column sections |
| Program Preview | Explain a program example | Guest | Mulai Program Saya | Back | Soft gate | Demo program | ProgramCard, GuestGate | Labeled “Contoh” |
| Food Preview | Explain meal/nutrition value | Guest | Buat rencana personal | View recipe example | Soft gate | Demo meal | MealCard, NutritionSummary | 4:3 image, no personal claims |
| Activity/Motion Preview | Explain movement experience | Guest | Mulai session personal | Browse example | Soft gate | Demo workout | WorkoutCard, MotionCoachCard | No camera claim |
| Progress Preview | Explain progress/patterns | Guest | Simpan progres | Back | Soft gate | Demo progress | ProgressCard, WeeklyActionCard | Demo label |
| Auth Gate Sheet | Explain why account is needed | Guest | Daftar | Masuk/Nanti | Public | Intended action | BottomSheet, GuestGate | Safe-area aware |
| Login | Authenticate | Returning | Masuk | Reset/register | Public | Credentials | Field, Button | Keyboard aware |
| Register | Create account | New | Daftar | Masuk | Public | Account minimum | Field, Consent link | No questionnaire here |
| Reset Password | Recover account | Returning | Kirim tautan | Back | Public | Email | Field, status | Preserves input |
| Create Program Intro | Start/resume setup | Auth user | Mulai/Lanjutkan | Nanti | Auth | Draft state | QuestionProgress | No bottom nav |
| Age & Actor | Age/context | Auth user | Lanjut | Back | Auth | Age, self/dependent | AgePicker, SelectionCard | One task; 12–75 |
| Body Basics | Weight/height | Auth user | Lanjut | Back | Auth | Measurements | WeightPicker, HeightPicker | Stack at small/large text |
| Goal | Primary intent | Auth user | Lanjut | Back | Auth | Goal options | SelectionCard | Full-width cards |
| Daily Activity | Daily context | Auth user | Lanjut | Back | Auth | Activity level | SelectionCard | Plain examples |
| Target & Pace | Conditional target | Eligible user | Lanjut | Skip if allowed | Conditional | Target, pace bounds | WeightPicker, SelectionCard | Policy-safe values |
| Safety Checkpoint | Required considerations | Auth user | Lanjut | Help | Conditional | Safety answers | MultiSelectionCard | No decoration/photo |
| Safety Result | Explain safe boundary | Auth user | Continue safely | Review answer/help | Conditional | Engine result | SafetyNotice, Button | No rule IDs |
| Guardian Consent | Teen/dependent consent | Guardian path | Confirm | Read details/back | Conditional | Consent | ConsentSummary, Checkbox | Full-width readable content |
| Required Consent | Privacy/terms | Auth user | Confirm | Read details | Auth | Consent records | ConsentSummary | No narrow row |
| Program Summary | Review eligible program | Auth user | Mulai Program | Edit answers | Conditional | Derived program | ProgramCard, summary rows | One primary CTA |
| Home | Daily guidance | Active user | Next task | Open sections | Auth | Program, Weekly Action, summaries | DailyProgramCard | Single column |
| Program Home | Program overview | Active user | Continue today | View schedule | Auth | Phase/tasks/review | ProgramCard, ProgressCard | Nav visible |
| Today Plan | List daily tasks | Active user | Complete next | Adjust/skip | Auth | Tasks/status | DailyProgramCard | Status + one CTA/card |
| Task Detail | Complete a task | Active user | Complete/save | Back | Auth | Task-specific | Contextual input | No competing feature UI |
| Baseline Journey | Explain baseline | Active user | Continue day | Why baseline | Auth | Baseline state | ProgressCard | Simple phase view |
| Baseline Day | Daily baseline input | Active user | Save | Back | Auth | Daily fields | Contextual controls | Keyboard safe |
| Weekly Review | Review and continue | Active user | Continue program | View evidence | Auth | Progress/pattern | ProgressCard | Plain summary |
| Food Today | Meal slots | Active user | Next meal action | Nutrition detail | Auth | Meals/status | MealCard | Single column |
| Add Food | Log meal item | Active user | Add/save | Cancel | Auth | Food/amount | Search, Stepper | Focused flow |
| Meal Detail | Review a meal | Active user | Confirm/log | Edit/swap | Auth | Items/nutrition | MealCard, summary | Summary before detail |
| Guided Meal | Personal menu | Eligible user | Start cooking | Swap/recipe | Conditional | Meal plan | MealCard | Photo 4:3 |
| Meal Plan | Daily/weekly meals | Eligible user | View next meal | Swap | Conditional | Plan | MealCard | Day grouping |
| Recipe Detail | Recipe guidance | Active user | Start cooking | Swap/save | Auth | Recipe | RecipeCard | Sections, sticky CTA if safe |
| Cooking Mode | Step-by-step cooking | Active user | Next step | Timer/back/exit | Auth | Recipe steps | Stepper, Timer | Full screen, nav hidden |
| Flex Kitchen | Build a recipe | Active user | Add ingredient | Saved recipes | Auth | Ingredients | Search, quantity controls | Progressive disclosure |
| Flex Summary | Review balance/suggestion | Active user | Save recipe | Edit/detail | Auth | Nutrition result | NutritionSummary | Advanced numbers collapsed |
| Nutrition Detail | Explain daily nutrition | Active user | View recommendation | Advanced indicator | Auth | Targets/intake | NutritionSummary | 1 column; chart alternative |
| Activity Today | Activity next action | Active user | Log/start | History | Auth | Activity/steps | ActivityCard | Simple daily summary |
| Add Activity | Record activity | Active user | Save | Cancel | Auth | Type/duration | SelectionCard, Time/number | Focused form |
| Workout Library | Choose workout | Eligible user | Select workout | Filter | Conditional | Workouts | WorkoutCard | 1 column/2 tablet |
| Workout Detail | Prepare workout | Eligible user | Start | Demo/back | Conditional | Workout/exercises | WorkoutCard | Safety visible |
| Motion Coach Home | Enter coach | Eligible user | Choose session | History | Conditional | Coach availability | MotionCoachCard | MVP/future status clear |
| Session Preparation | Safety/equipment check | Eligible user | Ready | Cancel | Conditional | Checklist | Selection/checklist | Full screen |
| Session Player | Run workout | Eligible user | Pause/continue | Stop/skip | Conditional | Timer/manual reps | Session controls | Nav hidden; distance readable |
| Workout Result | Review session | Active user | Selesai | View details | Auth | Completion/effort | ResultCard, PointBadge | No form-validation claim |
| Progress Home | Program progress | Active user | View current insight | Measurements/history | Auth | Completion/trends | ProgressCard | One main indicator |
| Measurements | Record/review body data | Active user | Add measurement | History | Auth | Measurements | WeightPicker, chart/text | Body-neutral |
| Pattern Map | Pattern overview | Active user | View pattern | Weekly Action | Auth | Phase 7 output | PatternCard | No internal scores |
| Pattern Detail | Explain evidence | Active user | Try action | Back | Auth | Pattern/evidence | EvidenceList | Expandable detail |
| Weekly Action Detail | Act/check progress | Active user | Catat hari ini | Why chosen | Auth | Action/progress | WeeklyActionCard | Prominent CTA |
| Sleep Detail | Sleep logging/trend | Active user | Add/check-in | History | Auth | Sleep | TimePicker, ProgressCard | Native time control |
| Digestive Detail | Digestive logging/trend | Active user | Add/check-in | History | Auth | Digestive log | SelectionCard | Plain, private wording |
| Achievements | Points/streak/level | Active user | View history | Hide preference | Auth | Gamification | Badges/cards | Secondary to health progress |
| Profile | Personal context | Auth user | Edit profile | Dependents | Auth | Profile | Summary cards | Avatar entry |
| Settings | Preferences/data | Auth user | Save | Account/help | Auth | Settings | List/controls | Large targets |
| Privacy & Data | Consent/data controls | Auth user | Manage/delete/export | Back | Auth | Records | Consent/data cards | No dark patterns |

## Current prototype/development routes

Design-system, prototype screen inventory, flow demos, and development-only routes should remain outside production user navigation and be protected by explicit developer/admin configuration.

