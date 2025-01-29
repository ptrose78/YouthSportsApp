'use client';
import useSetSiteData from '@/app/hooks/useSetSiteData';

const saveUser = async (email: string, team_name: string) => {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, team_name }),
    });
    
    if (!response.ok) throw new Error("Failed to add user.");
    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

const UserForm = () => {

  const setSiteData = useSetSiteData();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const team_name = formData.get("team_name") as string;

    const { result } = await saveUser(email, team_name);
    
    const user = result.user;
    const team = result.team;
  
    setSiteData({
      user_id: user.id,
      team_id: team.id,
      dbOperation: "create"
    });

    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="email" placeholder="Email" required />
      <input type="text" name="team_name" placeholder="Team Name" required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserForm;
