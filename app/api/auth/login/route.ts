import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // For now, use hardcoded admin credentials
    const validEmail = "admin@glgcapital.com";
    const validPassword = "Admin123!@#";

    if (email === validEmail && password === validPassword) {
      // Try to get or create admin user from database
      try {
        // First, try to find existing admin user
        const { data: existingAdmin, error: findError } = await supabaseAdmin
          .from('users')
          .select('id, email, first_name, last_name, role, is_active')
          .eq('email', validEmail)
          .single();

        if (existingAdmin && !findError) {
          // Admin user exists, return it
          const adminUser = {
            id: existingAdmin.id,
            email: existingAdmin.email,
            name: existingAdmin.first_name && existingAdmin.last_name 
              ? `${existingAdmin.first_name} ${existingAdmin.last_name}`
              : "Super Admin",
            role: existingAdmin.role,
          };

          return NextResponse.json({
            success: true,
            user: adminUser,
            message: "Login successful",
          });
        } else {
          // Admin user doesn't exist, create it
          const hashedPassword = await bcrypt.hash(validPassword, 12);
          
          const { data: newAdmin, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              email: validEmail,
              password_hash: hashedPassword,
              first_name: 'Super',
              last_name: 'Admin',
              role: 'superadmin',
              is_active: true,
              email_verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id, email, first_name, last_name, role, is_active')
            .single();

          if (createError || !newAdmin) {
            console.error('Failed to create admin user:', createError);
            // Fallback to hardcoded admin (temporary)
            const adminUser = {
              id: "superadmin-1",
              email: email,
              name: "Super Admin",
              role: "superadmin",
            };

            return NextResponse.json({
              success: true,
              user: adminUser,
              message: "Login successful (fallback mode)",
            });
          }

          const adminUser = {
            id: newAdmin.id,
            email: newAdmin.email,
            name: `${newAdmin.first_name} ${newAdmin.last_name}`,
            role: newAdmin.role,
          };

          return NextResponse.json({
            success: true,
            user: adminUser,
            message: "Login successful",
          });
        }
      } catch (dbError) {
        console.error('Database error for admin login:', dbError);
        // Fallback to hardcoded admin (temporary)
        const adminUser = {
          id: "superadmin-1",
          email: email,
          name: "Super Admin",
          role: "superadmin",
        };

        return NextResponse.json({
          success: true,
          user: adminUser,
          message: "Login successful (fallback mode)",
        });
      }
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
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
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