import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // For now, use hardcoded admin credentials
    const validEmail = "admin@glgcapital.com";
    const validPassword = "Admin123!@#";

    if (email === validEmail && password === validPassword) {
      const adminUser = {
        id: "superadmin-1",
        email: email,
        name: "Super Admin",
        role: "superadmin",
      };

      // Store admin session in localStorage (client-side)
      return NextResponse.json({
        success: true,
        user: adminUser,
        message: "Login successful",
      });
    } else {
      // Try Supabase authentication as fallback
      let supabase = supabaseAdmin;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      // Try to connect to Supabase
      try {
        supabase = supabaseAdmin;
      } catch (error) {
        console.log('Supabase connection failed, using offline mode');
        // For offline mode, allow any login with a simple password check
        if (password.length >= 6) {
          const mockUser = {
            id: 'mock-user-' + Date.now(),
            email: email,
            name: email.split('@')[0],
            role: 'user'
          };
          
          const response = NextResponse.json(
            {
              message: "Login successful (offline mode)",
              user: mockUser
            },
            { status: 200 }
          );
          
          response.cookies.set("auth-token", "offline-token-" + Date.now(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/"
          });
          
          return response;
        } else {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          );
        }
      }

      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, password_hash, first_name, last_name, role, is_active')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log("❌ User not found:", email);
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json(
          { error: "Account is deactivated" },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        console.log("❌ Invalid password for user:", email);
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      console.log("✅ User logged in successfully:", user.email);
      
      const response = NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role
          }
        },
        { status: 200 }
      );
      
      response.cookies.set("auth-token", "token-here", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/"
      });
      
      return response;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 