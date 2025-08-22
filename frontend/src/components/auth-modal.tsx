"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@apollo/client/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import {
  SIGN_UP_ORGANIZATION,
  LOGIN_ORGANIZATION,
  SignUpData,
  LoginData,
} from "@/graphql/auth-queries";

// Form validation schemas
const signUpSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const { toast } = useToast();
  const { setAuth } = useAuthStore();

  // Sign up mutation
  const [signUp, { loading: signUpLoading }] = useMutation<SignUpData>(
    SIGN_UP_ORGANIZATION,
    {
      onCompleted: (data) => {
        if (
          data?.signUpOrganization?.success &&
          data?.signUpOrganization?.apiKey &&
          data?.signUpOrganization?.organization
        ) {
          const { apiKey, organization } = data.signUpOrganization;
          setAuth(
            apiKey,
            organization.name,
            organization.contactEmail,
            organization.slug
          );
          toast({
            title: "Success!",
            description: "Organization created successfully. Welcome aboard!",
          });
          onClose();
        } else {
          toast({
            title: "Error",
            description:
              data?.signUpOrganization?.message ||
              "Failed to create organization",
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create organization",
          variant: "destructive",
        });
      },
    }
  );

  // Sign in mutation
  const [signIn, { loading: signInLoading }] = useMutation<LoginData>(
    LOGIN_ORGANIZATION,
    {
      onCompleted: (data) => {
        if (
          data?.loginOrganization?.success &&
          data?.loginOrganization?.apiKey &&
          data?.loginOrganization?.organization
        ) {
          const { apiKey, organization } = data.loginOrganization;
          setAuth(
            apiKey,
            organization.name,
            organization.contactEmail,
            organization.slug
          );
          toast({
            title: "Success!",
            description: "Welcome back!",
          });
          onClose();
        } else {
          toast({
            title: "Error",
            description:
              data?.loginOrganization?.message || "Failed to sign in",
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      },
    }
  );

  // Form setup
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSignUp = (data: SignUpFormData) => {
    signUp({
      variables: {
        name: data.name,
        contactEmail: data.contactEmail,
        password: data.password,
      },
    });
  };

  const onSignIn = (data: SignInFormData) => {
    signIn({
      variables: {
        email: data.email,
        password: data.password,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to Catalyst</DialogTitle>
          <DialogDescription className="text-center">
            Manage your projects and tasks efficiently
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...signInForm.register("email")}
                      className={
                        signInForm.formState.errors.email
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...signInForm.register("password")}
                        className={
                          signInForm.formState.errors.password
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signInLoading}
                  >
                    {signInLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Organization</CardTitle>
                <CardDescription>
                  Set up your organization to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUp)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter organization name"
                      {...signUpForm.register("name")}
                      className={
                        signUpForm.formState.errors.name ? "border-red-500" : ""
                      }
                    />
                    {signUpForm.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {signUpForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="Enter contact email"
                      {...signUpForm.register("contactEmail")}
                      className={
                        signUpForm.formState.errors.contactEmail
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {signUpForm.formState.errors.contactEmail && (
                      <p className="text-sm text-red-500">
                        {signUpForm.formState.errors.contactEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Create a password"
                        {...signUpForm.register("password")}
                        className={
                          signUpForm.formState.errors.password
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowSignUpPassword(!showSignUpPassword)
                        }
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signUpLoading}
                  >
                    {signUpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Organization"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
