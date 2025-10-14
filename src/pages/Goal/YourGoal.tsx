import { useState } from "react";
import { Bell, User, Clock } from "lucide-react";
import "./YourGoal.css";

const goalData = [
  {
    id: 1,
    title: "Water consumption",
    description: "Drink 5 cups of water",
    deadline: "23 March 2026",
    icon: (
      <svg
        width="28"
        height="32"
        viewBox="0 0 28 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.1714 26.6686C23.0418 27.7877 22.5035 28.8197 21.6599 29.5664C20.8162 30.3129 19.7266 30.7218 18.6 30.7143H8.49714C7.37054 30.7218 6.28085 30.3129 5.43719 29.5664C4.59351 28.8197 4.05525 27.7877 3.92571 26.6686L1 1H26.1429L23.1714 26.6686Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.05078 10.1431H25.0909"
          stroke="#05644C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Cycling Hero",
    description: "10 km / week",
    deadline: "20 July 2025",
    icon: (
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30.9061 4.31229C28.1748 4.45604 25.5873 5.46229 23.7186 7.33104L22.4248 8.62479C24.5811 8.62479 26.5936 9.63104 27.8873 11.356C28.7498 12.3623 30.0436 12.9373 31.4811 12.9373C34.2123 12.9373 36.3686 10.6373 35.9373 7.90604C35.5061 5.74979 33.3498 4.16854 30.9061 4.31229Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.625 41.6875C12.5945 41.6875 15.8125 38.4695 15.8125 34.5C15.8125 30.5305 12.5945 27.3125 8.625 27.3125C4.65545 27.3125 1.4375 30.5305 1.4375 34.5C1.4375 38.4695 4.65545 41.6875 8.625 41.6875Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.375 41.6875C41.3445 41.6875 44.5625 38.4695 44.5625 34.5C44.5625 30.5305 41.3445 27.3125 37.375 27.3125C33.4055 27.3125 30.1875 30.5305 30.1875 34.5C30.1875 38.4695 33.4055 41.6875 37.375 41.6875Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.3755 20.1248H30.188L25.588 15.5248C24.1505 14.0873 21.7067 13.9435 20.1255 15.381L15.0942 19.6935C13.9442 20.6998 14.088 22.4248 15.3817 23.2873L24.438 28.7498L21.563 37.3748"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.5934 16.5312L17.5371 24.4375"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Daily Running",
    description: "5 km / week",
    deadline: "20 July 2025",
    icon: (
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30.9061 4.31229C28.1748 4.45604 25.5873 5.46229 23.7186 7.33104L22.4248 8.62479C24.5811 8.62479 26.5936 9.63104 27.8873 11.356C28.7498 12.3623 30.0436 12.9373 31.4811 12.9373C34.2123 12.9373 36.3686 10.6373 35.9373 7.90604C35.5061 5.74979 33.3498 4.16854 30.9061 4.31229Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.625 41.6875C12.5945 41.6875 15.8125 38.4695 15.8125 34.5C15.8125 30.5305 12.5945 27.3125 8.625 27.3125C4.65545 27.3125 1.4375 30.5305 1.4375 34.5C1.4375 38.4695 4.65545 41.6875 8.625 41.6875Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.375 41.6875C41.3445 41.6875 44.5625 38.4695 44.5625 34.5C44.5625 30.5305 41.3445 27.3125 37.375 27.3125C33.4055 27.3125 30.1875 30.5305 30.1875 34.5C30.1875 38.4695 33.4055 41.6875 37.375 41.6875Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.3755 20.1248H30.188L25.588 15.5248C24.1505 14.0873 21.7067 13.9435 20.1255 15.381L15.0942 19.6935C13.9442 20.6998 14.088 22.4248 15.3817 23.2873L24.438 28.7498L21.563 37.3748"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.5934 16.5312L17.5371 24.4375"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Daily Steps",
    description: "10000 steps / week",
    deadline: "20 July 2025",
    icon: (
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30.9061 4.31229C28.1748 4.45604 25.5873 5.46229 23.7186 7.33104L22.4248 8.62479C24.5811 8.62479 26.5936 9.63104 27.8873 11.356C28.7498 12.3623 30.0436 12.9373 31.4811 12.9373C34.2123 12.9373 36.3686 10.6373 35.9373 7.90604C35.5061 5.74979 33.3498 4.16854 30.9061 4.31229Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.625 41.6875C12.5945 41.6875 15.8125 38.4695 15.8125 34.5C15.8125 30.5305 12.5945 27.3125 8.625 27.3125C4.65545 27.3125 1.4375 30.5305 1.4375 34.5C1.4375 38.4695 4.65545 41.6875 8.625 41.6875Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.375 41.6875C41.3445 41.6875 44.5625 38.4695 44.5625 34.5C44.5625 30.5305 41.3445 27.3125 37.375 27.3125C33.4055 27.3125 30.1875 30.5305 30.1875 34.5C30.1875 38.4695 33.4055 41.6875 37.375 41.6875Z"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.3755 20.1248H30.188L25.588 15.5248C24.1505 14.0873 21.7067 13.9435 20.1255 15.381L15.0942 19.6935C13.9442 20.6998 14.088 22.4248 15.3817 23.2873L24.438 28.7498L21.563 37.3748"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.5934 16.5312L17.5371 24.4375"
          stroke="#05644C"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

interface GoalCardProps {
  title: string;
  description: string;
  deadline: string;
  icon: React.ReactNode;
}

function GoalCard({ title, description, deadline, icon }: GoalCardProps) {
  return (
    <div className="w-full h-[106px] rounded-xl goal-card-bg shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 p-3 flex items-start">
        <div className="w-[53px] h-[53px] bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-brightnest-primary font-dm-sans text-xl font-medium leading-none">
            {title}
          </h3>
          <p className="text-black font-dm-sans text-sm mt-2 leading-none">{description}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white mx-3"></div>
      <div className="absolute bottom-2 left-[72px] flex items-center text-white font-poppins text-xs">
        <Clock className="w-[17px] h-[17px] mr-2" />
        <span>Deadline {deadline}</span>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
}

function FormField({ label, value, placeholder }: FormFieldProps) {
  return (
    <div className="w-full goal-field p-4 border-0">
      <label className="text-brightnest-text-muted font-dm-sans text-base block mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="text-gray-800 font-dm-sans text-xl bg-transparent border-0 outline-none w-full"
        readOnly
      />
    </div>
  );
}

export default function GoalPage() {
  const [newGoal] = useState({
    title: "Water consumption",
    description: "Drink 5 cups of water",
    reset: "Every day",
    maturity: "6 Months",
  });

  return (
    <div className="goals-bg relative overflow-y-auto flex flex-col">
      <main className="px-8 py-12 flex-grow">
        <div className="mb-8">
          <h2 className="text-brightnest-primary font-dm-sans text-5xl font-bold leading-[46px] capitalize mb-4">
            Your Goals
          </h2>
          <div className="text-center mb-8">
            <h3 className="text-brightnest-accent font-pacifico text-4xl leading-[50px] max-w-[789px] mx-auto">
              You are almost there, Don't give up!!!
            </h3>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 max-w-[358px]">
            <h3 className="text-brightnest-primary font-poppins text-2xl font-semibold tracking-[0.5px] mb-6">
              Goal Preview
            </h3>
            <div className="space-y-4 h-[420px] overflow-y-auto pr-2 no-scrollbar">
              {goalData.map((goal) => (
                <GoalCard
                  key={goal.id}
                  title={goal.title}
                  description={goal.description}
                  deadline={goal.deadline}
                  icon={goal.icon}
                />
              ))}
              {goalData.map((goal) => (
                <GoalCard
                  key={goal.id + "-clone"}
                  title={goal.title}
                  description={goal.description}
                  deadline={goal.deadline}
                  icon={goal.icon}
                />
              ))}
            </div>
          </div>

          <div className="goal-divider h-[496px] mx-8"></div>

          <div className="flex-1 max-w-[358px]">
            <h3 className="text-brightnest-primary font-dm-sans text-2xl font-semibold tracking-[0.5px] mb-8">
              Add New Goal
            </h3>
            <div className="space-y-4">
              <FormField label="Goal Title" value={newGoal.title} />
              <FormField label="Goal Description" value={newGoal.description} />
              <FormField label="Reset" value={newGoal.reset} />
              <FormField label="Maturity Date" value={newGoal.maturity} />
            </div>
            <div className="mt-8 flex justify-end">
              <button className="goal-add-btn font-dm-sans text-2xl tracking-[0.5px] transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
