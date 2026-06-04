CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"password" text,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "computer_specs" (
	"resource_id" text PRIMARY KEY NOT NULL,
	"cpu" text,
	"ram" text,
	"disk" text,
	"screen" text
);
--> statement-breakpoint
CREATE TABLE "department_members" (
	"department_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_members_department_id_user_id_pk" PRIMARY KEY("department_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"head_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "failure_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"reported_by_user_id" text NOT NULL,
	"technician_user_id" text,
	"status" text DEFAULT 'REPORTED' NOT NULL,
	"type" text,
	"frequency" text,
	"description" text NOT NULL,
	"reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"severity" text DEFAULT 'NORMAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "need_items" (
	"id" text PRIMARY KEY NOT NULL,
	"need_request_id" text NOT NULL,
	"resource_type" text NOT NULL,
	"brand" text,
	"cpu" text,
	"ram" text,
	"disk" text,
	"screen" text,
	"print_speed" text,
	"resolution" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"justification" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "need_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"notes" text,
	"submitted_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"sent_to_manager_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "printer_specs" (
	"resource_id" text PRIMARY KEY NOT NULL,
	"print_speed" text,
	"resolution" text
);
--> statement-breakpoint
CREATE TABLE "resource_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"target_type" text NOT NULL,
	"assigned_to_user_id" text,
	"assigned_to_department_id" text,
	"assigned_by_user_id" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unassigned_at" timestamp with time zone,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" text PRIMARY KEY NOT NULL,
	"inventory_code" text NOT NULL,
	"resource_type" text NOT NULL,
	"brand" text,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"supplier_id" text,
	"tender_id" text,
	"offer_id" text,
	"delivery_date" text,
	"warranty_end_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_offer_items" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"tender_item_id" text,
	"resource_type" text NOT NULL,
	"brand" text NOT NULL,
	"unit_price" numeric(14, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"warranty_duration_months" integer NOT NULL,
	"future_delivery_date" text NOT NULL,
	"technical_details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"total_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"elimination_reason" text,
	"rejection_reason" text,
	"submitted_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"decided_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"location" text,
	"address" text,
	"website" text,
	"manager_name" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"blacklisted_at" timestamp with time zone,
	"blacklist_reason" text,
	"owner_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technical_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"failure_report_id" text NOT NULL,
	"technician_user_id" text NOT NULL,
	"explanation" text NOT NULL,
	"appeared_at" text NOT NULL,
	"frequency" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tender_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"resource_type" text NOT NULL,
	"brand" text,
	"specs" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"source_need_item_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"published_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"awarded_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"awarded_offer_id" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"role" text DEFAULT 'TEACHER' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"department_id" text,
	"supplier_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warranty_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"failure_report_id" text NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"decided_by_user_id" text NOT NULL,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "computer_specs" ADD CONSTRAINT "computer_specs_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "failure_reports" ADD CONSTRAINT "failure_reports_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "failure_reports" ADD CONSTRAINT "failure_reports_reported_by_user_id_user_id_fk" FOREIGN KEY ("reported_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_items" ADD CONSTRAINT "need_items_need_request_id_need_requests_id_fk" FOREIGN KEY ("need_request_id") REFERENCES "public"."need_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_requests" ADD CONSTRAINT "need_requests_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_requests" ADD CONSTRAINT "need_requests_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "printer_specs" ADD CONSTRAINT "printer_specs_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_assignments" ADD CONSTRAINT "resource_assignments_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_offer_items" ADD CONSTRAINT "supplier_offer_items_offer_id_supplier_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."supplier_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_offers" ADD CONSTRAINT "supplier_offers_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_offers" ADD CONSTRAINT "supplier_offers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_reports" ADD CONSTRAINT "technical_reports_failure_report_id_failure_reports_id_fk" FOREIGN KEY ("failure_report_id") REFERENCES "public"."failure_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_items" ADD CONSTRAINT "tender_items_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_actions" ADD CONSTRAINT "warranty_actions_failure_report_id_failure_reports_id_fk" FOREIGN KEY ("failure_report_id") REFERENCES "public"."failure_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_code_idx" ON "departments" USING btree ("code");--> statement-breakpoint
CREATE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "failures_resource_idx" ON "failure_reports" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "failures_status_idx" ON "failure_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "failures_technician_idx" ON "failure_reports" USING btree ("technician_user_id");--> statement-breakpoint
CREATE INDEX "need_items_request_idx" ON "need_items" USING btree ("need_request_id");--> statement-breakpoint
CREATE INDEX "need_requests_dept_idx" ON "need_requests" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "need_requests_status_idx" ON "need_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "resource_assignments_resource_idx" ON "resource_assignments" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_assignments_user_idx" ON "resource_assignments" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "resource_assignments_dept_idx" ON "resource_assignments" USING btree ("assigned_to_department_id");--> statement-breakpoint
CREATE INDEX "resource_assignments_active_idx" ON "resource_assignments" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "resources_inventory_idx" ON "resources" USING btree ("inventory_code");--> statement-breakpoint
CREATE INDEX "resources_status_idx" ON "resources" USING btree ("status");--> statement-breakpoint
CREATE INDEX "resources_type_idx" ON "resources" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "supplier_offer_items_offer_idx" ON "supplier_offer_items" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "supplier_offers_tender_idx" ON "supplier_offers" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "supplier_offers_supplier_idx" ON "supplier_offers" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_offers_status_idx" ON "supplier_offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "suppliers_name_idx" ON "suppliers" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "suppliers_status_idx" ON "suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tender_items_tender_idx" ON "tender_items" USING btree ("tender_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenders_reference_idx" ON "tenders" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "tenders_status_idx" ON "tenders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenders_start_idx" ON "tenders" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "tenders_end_idx" ON "tenders" USING btree ("end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_department_idx" ON "user" USING btree ("department_id");