
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../module/auth/decorators/public.decorators';

@Public()
@Controller()
export class WebController {
  @Get()
  home(@Res() res: Response) {
    return res.redirect('/login');
  }

  @Get('login')
  login(@Res() res: Response) {
    return res.render('auth/login', {
      title: 'ورود به سامانه',
    });
  }

  @Get('register')
  register(@Res() res: Response) {
    return res.render('auth/register', {
      title: 'ثبت‌نام کارمند',
    });
  }

  @Get('manager')
  managerDashboard(@Res() res: Response) {
    return res.render('app', {
      title: 'داشبورد مدیر',
      page: 'manager-dashboard',
      role: 'MANAGER',
    });
  }

  @Get('manager/departments')
  managerDepartments(@Res() res: Response) {
    return res.render('app', {
      title: 'مدیریت دپارتمان‌ها',
      page: 'manager-departments',
      role: 'MANAGER',
    });
  }

  @Get('manager/groups')
  managerGroups(@Res() res: Response) {
    return res.render('app', {
      title: 'گروه‌های شغلی و پایه حقوق',
      page: 'manager-groups',
      role: 'MANAGER',
    });
  }

  @Get('manager/payroll')
  managerPayroll(@Res() res: Response) {
    return res.render('app', {
      title: 'مدیریت فیش‌های حقوقی',
      page: 'manager-payroll',
      role: 'MANAGER',
    });
  }

  @Get('manager/create-manager')
  createManager(@Res() res: Response) {
    return res.render('app', {
      title: 'ساخت حساب مدیر',
      page: 'manager-create-manager',
      role: 'MANAGER',
    });
  }

  @Get('employee')
  employeeDashboard(@Res() res: Response) {
    return res.render('app', {
      title: 'داشبورد کارمند',
      page: 'employee-dashboard',
      role: 'EMPLOYE',
    });
  }

  @Get('employee/attendance')
  employeeAttendance(@Res() res: Response) {
    return res.render('app', {
      title: 'حضور و غیاب',
      page: 'employee-attendance',
      role: 'EMPLOYE',
    });
  }

  @Get('employee/payroll')
  employeePayroll(@Res() res: Response) {
    return res.render('app', {
      title: 'فیش‌های حقوقی من',
      page: 'employee-payroll',
      role: 'EMPLOYE',
    });
  }

  @Get('employee/departments')
  employeeDepartments(@Res() res: Response) {
    return res.render('app', {
      title: 'دپارتمان‌ها',
      page: 'employee-departments',
      role: 'EMPLOYE',
    });
  }

  @Get('employee/account')
  employeeAccount(@Res() res: Response) {
    return res.render('app', {
      title: 'حساب کاربری',
      page: 'employee-account',
      role: 'EMPLOYE',
    });
  }

  @Get('403')
  forbidden(@Res() res: Response) {
    return res.render('errors/403', {
      title: 'عدم دسترسی',
    });
  }

  @Get('404')
  notFound(@Res() res: Response) {
    return res.render('errors/404', {
      title: 'صفحه پیدا نشد',
    });
  }
}
