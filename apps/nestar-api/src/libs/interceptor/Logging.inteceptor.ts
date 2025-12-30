
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { stringify } from 'querystring';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

    private readonly logger: Logger = new Logger();

    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const recordTime = Date.now();
        const responsetType = context.getType<GqlContextType>();

        if (responsetType === "http") {
            /* Develop if needed! */
        } else if (responsetType === "graphql") {
            /* (1) Print Request */
            const gplContext = GqlExecutionContext.create(context);
            this.logger.log(`${this.stringify(gplContext.getContext().req.body)}`, "REQUEST");

            /* (2) Errors handing via GraphQL */
            /* (3) No Errors, giving Response below */
            return next.handle().pipe(
                tap((context) => {
                    const responseTime = Date.now() - recordTime
                    this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, "RESPONSE");
                }),
            );
        }
    }

    private stringify(context: ExecutionContext): string {
        return JSON.stringify(context).slice(0, 75);
    }
}
