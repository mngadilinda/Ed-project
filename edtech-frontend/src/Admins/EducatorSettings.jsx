import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

export default function EducatorSettings() {
  const [name, setName] = useState('Dr. Sarah Johnson');
  const [email, setEmail] = useState('sarah.johnson@example.com');
  const [bio, setBio] = useState('Computer Science Professor with 10+ years of teaching experience');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (API call in real app)
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div>
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileImage || "/default-avatar.jpg"} />
                      <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile Picture</Label>
                    <Input 
                      id="profileImage" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="w-fit"
                    />
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>

                <CardFooter className="flex justify-end px-0 pt-6 pb-0">
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label>Danger Zone</Label>
                  <div className="mt-4 space-y-4">
                    <Button variant="outline" className="text-red-600 border-red-600">
                      Deactivate Account
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-600">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your courses and students
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled} 
                  />
                </div>

                {notificationsEnabled && (
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center space-x-4">
                      <Switch id="new-students" defaultChecked />
                      <Label htmlFor="new-students">New student enrollments</Label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Switch id="course-completions" defaultChecked />
                      <Label htmlFor="course-completions">Course completions</Label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Switch id="student-messages" defaultChecked />
                      <Label htmlFor="student-messages">Student messages</Label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Switch id="promotional" />
                      <Label htmlFor="promotional">Promotional offers</Label>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <div className="flex items-center space-x-4">
                    <Switch id="public-profile" defaultChecked />
                    <Label htmlFor="public-profile">Make my profile public</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When enabled, your profile will be visible to all students
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Course Analytics Sharing</Label>
                  <div className="flex items-center space-x-4">
                    <Switch id="share-analytics" />
                    <Label htmlFor="share-analytics">Share anonymous course analytics</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Help improve our platform by sharing anonymous usage data
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Data Export</Label>
                  <Button variant="outline">Request Data Export</Button>
                  <p className="text-sm text-muted-foreground">
                    Download all your personal data from our platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}